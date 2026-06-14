// src/app/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const today = new Date().toISOString().split('T')[0]

  const [
    profileRes,
    missionsRes,
    progressRes,
    activityRes,
    snapshotRes,
    achievementsRes,
    marketRes,
  ] = await Promise.all([
  
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
  .from('missions')
  .select('*')
  .eq('user_id', user.id)
  .in('status', ['active', 'pending'])
  .order('created_at', { ascending: false }),

    supabase.from('user_skill_progress').select('*').eq('user_id', user.id),
    supabase.from('daily_activity').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(14),
    supabase.from('readiness_snapshots').select('*').eq('user_id', user.id).order('snapshot_date', { ascending: false }).limit(1).single(),
    supabase.from('user_achievements').select('*, achievements(*)').eq('user_id', user.id).order('earned_at', { ascending: false }).limit(5),
    supabase.from('market_intelligence').select('*').order('demand_score', { ascending: false }).limit(6),
  ])
console.log("MISSIONS FROM SERVER =", missionsRes.data)
  return (
    <DashboardClient
      profile={profileRes.data}
      todayMissions={missionsRes.data ?? []}
      skillProgress={progressRes.data ?? []}
      recentActivity={activityRes.data ?? []}
      latestSnapshot={snapshotRes.data}
      recentAchievements={achievementsRes.data ?? []}
      marketIntelligence={marketRes.data ?? []}
    />
  )
}
