// src/app/skill-tree/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SkillTreeClient } from '@/components/skill-tree/SkillTreeClient'

export const dynamic = 'force-dynamic'

export default async function SkillTreePage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [domainsRes, nodesRes, progressRes] = await Promise.all([
    supabase.from('skill_domains').select('*').order('sort_order'),
    supabase.from('skill_nodes').select('*').order('sort_order'),
    supabase.from('user_skill_progress').select('*').eq('user_id', user.id),
  ])

  return (
    <SkillTreeClient
      domains={domainsRes.data ?? []}
      nodes={nodesRes.data ?? []}
      progress={progressRes.data ?? []}
    />
  )
}
