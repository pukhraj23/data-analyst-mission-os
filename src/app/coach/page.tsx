// src/app/coach/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CoachClient } from '@/components/coach/CoachClient'

export const dynamic = 'force-dynamic'

export default async function CoachPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, conversationsRes, skillNodesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('coach_conversations').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(10),
    supabase.from('skill_nodes').select('id, name, domain_id').order('sort_order'),
  ])

  return (
    <CoachClient
      profile={profileRes.data}
      conversations={conversationsRes.data ?? []}
      skillNodes={skillNodesRes.data ?? []}
    />
  )
}
