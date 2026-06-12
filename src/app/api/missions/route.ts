// src/app/api/missions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { generateDailyMission, generateRecoveryMission, checkSkillUnlocks } from '@/lib/engines/mission-engine'
import type { Profile, UserSkillProgress, SkillNode, Mission } from '@/types'

export async function GET(request: NextRequest) {
console.log("MISSION API HIT")
  const supabase = createRouteClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'today'
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  if (type === 'today') {
    const { data: missions, error } = await supabase
      .from('missions')
      .select('*')
      .eq('user_id', user.id)
      .eq('scheduled_date', date)
      .order('priority', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: missions, success: true })
  }

  if (type === 'weekly') {
    const startOfWeek = getStartOfWeek(new Date())
    const endOfWeek = getEndOfWeek(new Date())

    const { data: missions, error } = await supabase
      .from('missions')
      .select('*')
      .eq('user_id', user.id)
      .gte('scheduled_date', startOfWeek)
      .lte('scheduled_date', endOfWeek)
      .order('scheduled_date', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: missions, success: true })
  }

  return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
}

export async function POST(request: NextRequest) {
  const supabase = createRouteClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action } = body

  if (action === 'generate') {
    // Fetch all required data
    const [profileResult, progressResult, nodesResult, existingResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('user_skill_progress').select('*').eq('user_id', user.id),
      supabase.from('skill_nodes').select('*'),
      supabase.from('missions').select('*').eq('user_id', user.id).in('status', ['pending', 'active']),
    ])
    console.log("PROFILE ERROR:", profileResult.error)
console.log("PROGRESS ERROR:", progressResult.error)
console.log("NODES ERROR:", nodesResult.error)
console.log("EXISTING ERROR:", existingResult.error)
    if (profileResult.error) return NextResponse.json({ error: profileResult.error.message }, { status: 500 })

    const profile = profileResult.data as Profile
    const skillProgress = (progressResult.data ?? []) as UserSkillProgress[]
    const skillNodes = (nodesResult.data ?? []) as SkillNode[]
    const existingMissions = (existingResult.data ?? []) as Mission[]

    // Check if streak is broken for recovery mission
    const lastActiveDate = profile.last_active_date
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const streakBroken = lastActiveDate && lastActiveDate < yesterday

    let generatedMission
    if (streakBroken && profile.current_streak === 0) {
      generatedMission = generateRecoveryMission(skillProgress, skillNodes)
    } else {
      generatedMission = generateDailyMission({
        profile,
        skillProgress,
        skillNodes,
        existingMissions,
      })
    }

    if (!generatedMission) {
      return NextResponse.json({
        data: null,
        message: 'No new missions to generate — complete your active mission first!',
        success: true
      })
    }

    const { data: newMission, error: insertError } = await supabase
      .from('missions')
      .insert({
        user_id: user.id,
        ...generatedMission,
        status: 'active',
        scheduled_date: today,
        due_date: today,
      })
      .select()
      .single()
console.log("MISSION INSERT ERROR:", insertError)
console.log("GENERATED MISSION:", generatedMission)
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

    return NextResponse.json({ data: newMission, success: true })
  }

  if (action === 'complete_task') {
    const { missionId, taskId } = body

    const { data: mission, error: fetchError } = await supabase
      .from('missions')
      .select('*')
      .eq('id', missionId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    // Update task status
    const tasks = (mission.tasks as Mission['tasks']).map((t: Mission['tasks'][0]) =>
      t.id === taskId ? { ...t, status: 'completed' } : t
    )

    // Check if all tasks are completed
    const allCompleted = tasks.every((t: Mission['tasks'][0]) => t.status === 'completed')

    const { error: updateError } = await supabase
      .from('missions')
      .update({
        tasks,
        status: allCompleted ? 'completed' : 'active',
        completed_at: allCompleted ? new Date().toISOString() : null,
      })
      .eq('id', missionId)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    // Find task XP
    const task = tasks.find((t: Mission['tasks'][0]) => t.id === taskId)
    const xpEarned = task?.xp_reward ?? 25

    return NextResponse.json({
      data: { tasksUpdated: tasks, missionCompleted: allCompleted, xpEarned },
      success: true
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

// Helper functions
function getStartOfWeek(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

function getEndOfWeek(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? 0 : 7)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}
