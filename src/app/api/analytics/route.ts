// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'

export async function GET(request: NextRequest) {
  const supabase = createRouteClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') ?? '30')

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  const [activityResult, snapshotResult, xpResult, achievementsResult, marketResult] = await Promise.all([
    supabase
      .from('daily_activity')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDateStr)
      .order('date', { ascending: true }),
    supabase
      .from('readiness_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .gte('snapshot_date', startDateStr)
      .order('snapshot_date', { ascending: true }),
    supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false }),
    supabase.from('market_intelligence').select('*').order('demand_score', { ascending: false }),
  ])

  const activity = activityResult.data ?? []
  const snapshots = snapshotResult.data ?? []

  // Calculate learning velocity (XP per day over last 7 days vs previous 7 days)
  const last7 = activity.slice(-7)
  const prev7 = activity.slice(-14, -7)
  const recentAvgXP = last7.reduce((s, d) => s + d.xp_earned, 0) / Math.max(last7.length, 1)
  const prevAvgXP = prev7.reduce((s, d) => s + d.xp_earned, 0) / Math.max(prev7.length, 1)
  const velocityTrend = prevAvgXP === 0 ? 100 : Math.round(((recentAvgXP - prevAvgXP) / prevAvgXP) * 100)

  // Total time invested
  const totalMinutes = activity.reduce((s, d) => s + d.time_spent_minutes, 0)

  // Skill growth by domain from snapshots
  const latestSnapshot = snapshots[snapshots.length - 1]
  const earliestSnapshot = snapshots[0]

  // Consistency score (% of days with activity in last 30 days)
  const daysWithActivity = activity.filter(d => d.xp_earned > 0).length
  const consistencyScore = Math.round((daysWithActivity / days) * 100)

  return NextResponse.json({
    data: {
      activity,
      readinessSnapshots: snapshots,
      recentTransactions: xpResult.data ?? [],
      achievements: achievementsResult.data ?? [],
      marketIntelligence: marketResult.data ?? [],
      summary: {
        totalXP: activity.reduce((s, d) => s + d.xp_earned, 0),
        totalMinutes,
        totalHours: Math.round(totalMinutes / 60),
        totalMissions: activity.reduce((s, d) => s + d.missions_completed, 0),
        totalTasks: activity.reduce((s, d) => s + d.tasks_completed, 0),
        learningVelocity: Math.round(recentAvgXP),
        velocityTrend,
        consistencyScore,
        internshipReadinessGain: latestSnapshot && earliestSnapshot
          ? latestSnapshot.internship_readiness - earliestSnapshot.internship_readiness
          : 0,
      },
    },
    success: true
  })
}
