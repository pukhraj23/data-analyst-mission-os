// src/app/missions/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MissionsClient } from '@/components/missions/MissionsClient'

export const dynamic = 'force-dynamic'

export default async function MissionsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: missions } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  return <MissionsClient initialMissions={missions ?? []} />
}
