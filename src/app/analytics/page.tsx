// src/app/analytics/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsClient } from '@/components/analytics/AnalyticsClient'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const startDate = thirtyDaysAgo.toISOString().split('T')[0]

  const [activityRes, snapshotsRes, xpRes, achievementsRes] = await Promise.all([
    supabase.from('daily_activity').select('*').eq('user_id', user.id)
      .gte('date', startDate).order('date', { ascending: true }),
    supabase.from('readiness_snapshots').select('*').eq('user_id', user.id)
      .gte('snapshot_date', startDate).order('snapshot_date', { ascending: true }),
    supabase.from('xp_transactions').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(100),
    supabase.from('user_achievements').select('*, achievements(*)').eq('user_id', user.id)
      .order('earned_at', { ascending: false }),
  ])

  return (
    <AnalyticsClient
      activity={activityRes.data ?? []}
      snapshots={snapshotsRes.data ?? []}
      xpTransactions={xpRes.data ?? []}
      achievements={achievementsRes.data ?? []}
    />
  )
}
