// src/app/api/xp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { calculateXPAward, calculateStreak, getStreakBonusXP } from '@/lib/engines/xp-engine'
import { checkSkillUnlocks } from '@/lib/engines/mission-engine'
import type { Profile, UserSkillProgress, SkillNode } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = createRouteClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { amount, type, referenceId, description, metadata } = body

  if (!amount || !type) {
    return NextResponse.json({ error: 'amount and type are required' }, { status: 400 })
  }

  // Fetch current profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Calculate streak
  const streakResult = calculateStreak(profile.last_active_date, profile.current_streak)
  const streakBonus = streakResult.isNewDay ? getStreakBonusXP(streakResult.newStreak) : 0
  const totalXP = amount + streakBonus

  // Calculate new XP state
  const xpResult = calculateXPAward(profile.total_xp, totalXP)

  // Log XP transaction
  const { error: txError } = await supabase.from('xp_transactions').insert({
    user_id: user.id,
    amount: totalXP,
    transaction_type: type,
    reference_id: referenceId ?? null,
    description: description ?? null,
    metadata: metadata ?? {},
  })

  if (txError) {
    console.error('XP transaction error:', txError)
  }

  // Log streak bonus if applicable
  if (streakBonus > 0) {
    await supabase.from('xp_transactions').insert({
      user_id: user.id,
      amount: streakBonus,
      transaction_type: 'streak_bonus',
      reference_id: null,
      description: `${streakResult.newStreak}-day streak bonus`,
      metadata: { streak: streakResult.newStreak },
    })
  }

  // Update profile
  const today = new Date().toISOString().split('T')[0]
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      total_xp: xpResult.newTotalXP,
      current_xp: xpResult.newCurrentXP,
      xp_to_next_level: xpResult.xpToNextLevel,
      current_level: xpResult.newLevel.id,
      current_streak: streakResult.newStreak,
      longest_streak: Math.max(profile.longest_streak, streakResult.newStreak),
      last_active_date: today,
    })
    .eq('id', user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Update or create daily activity
  const { data: existingActivity } = await supabase
    .from('daily_activity')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  if (existingActivity) {
    await supabase
      .from('daily_activity')
      .update({
        xp_earned: existingActivity.xp_earned + totalXP,
        tasks_completed: existingActivity.tasks_completed + (type === 'task_complete' ? 1 : 0),
        missions_completed: existingActivity.missions_completed + (type === 'mission_complete' ? 1 : 0),
        streak_day: streakResult.newStreak,
      })
      .eq('id', existingActivity.id)
  } else {
    await supabase.from('daily_activity').insert({
      user_id: user.id,
      date: today,
      xp_earned: totalXP,
      tasks_completed: type === 'task_complete' ? 1 : 0,
      missions_completed: type === 'mission_complete' ? 1 : 0,
      streak_day: streakResult.newStreak,
    })
  }

  // Check for skill unlocks if a skill was completed
  if (type === 'skill_unlock' || type === 'task_complete') {
    const [progressResult, nodesResult] = await Promise.all([
      supabase.from('user_skill_progress').select('*').eq('user_id', user.id),
      supabase.from('skill_nodes').select('*'),
    ])

    const skillProgress = (progressResult.data ?? []) as UserSkillProgress[]
    const skillNodes = (nodesResult.data ?? []) as SkillNode[]
    const toUnlock = checkSkillUnlocks(skillProgress, skillNodes)

    if (toUnlock.length > 0) {
      // Unlock new skills
      const unlockPromises = toUnlock.map(nodeId =>
        supabase
          .from('user_skill_progress')
          .update({ status: 'available' })
          .eq('user_id', user.id)
          .eq('skill_node_id', nodeId)
      )
      await Promise.all(unlockPromises)
    }
  }

  // Check achievements
  const newAchievements = await checkAndAwardAchievements(
    supabase,
    user.id,
    xpResult.newTotalXP,
    streakResult.newStreak,
    xpResult.newLevel.id
  )

  return NextResponse.json({
    data: {
      xpAwarded: totalXP,
      streakBonus,
      newTotalXP: xpResult.newTotalXP,
      newLevel: xpResult.newLevel,
      leveledUp: xpResult.leveledUp,
      levelProgress: xpResult.progressPercent,
      xpToNextLevel: xpResult.xpToNextLevel,
      streakUpdated: streakResult.isNewDay,
      newStreak: streakResult.newStreak,
      streakBroken: streakResult.streakBroken,
      achievementsUnlocked: newAchievements,
    },
    success: true
  })
}

async function checkAndAwardAchievements(
  supabase: ReturnType<typeof createRouteClient>,
  userId: string,
  totalXP: number,
  streak: number,
  level: number
): Promise<string[]> {
  // Get all achievements not yet earned
  const [allAchievements, earned] = await Promise.all([
    supabase.from('achievements').select('*'),
    supabase.from('user_achievements').select('achievement_id').eq('user_id', userId),
  ])

  const earnedIds = new Set((earned.data ?? []).map(e => e.achievement_id))
  const pending = (allAchievements.data ?? []).filter(a => !earnedIds.has(a.id))

  const newlyEarned: string[] = []

  for (const achievement of pending) {
    let earned = false

    switch (achievement.condition_type) {
      case 'streak':
        earned = streak >= (achievement.condition_value ?? 0)
        break
      case 'level_reach':
        earned = level >= (achievement.condition_value ?? 0)
        break
      case 'xp_total':
        earned = totalXP >= (achievement.condition_value ?? 0)
        break
    }

    if (earned) {
      await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: achievement.id,
        xp_awarded: achievement.xp_reward,
      })
      newlyEarned.push(achievement.id)

      // Award achievement XP
      if (achievement.xp_reward > 0) {
        await supabase.from('xp_transactions').insert({
          user_id: userId,
          amount: achievement.xp_reward,
          transaction_type: 'badge_earned',
          reference_id: achievement.id,
          description: `Achievement unlocked: ${achievement.name}`,
          metadata: { achievement_id: achievement.id },
        })
      }
    }
  }

  return newlyEarned
}
