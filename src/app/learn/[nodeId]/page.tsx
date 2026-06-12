// src/app/learn/[nodeId]/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LessonClient } from '@/components/learn/LessonClient'
import { getLessonForNode } from '@/lib/data/sql-lessons'

export const dynamic = 'force-dynamic'

export default async function LearnPage({ params }: { params: { nodeId: string } }) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [nodeRes, progressRes] = await Promise.all([
    supabase.from('skill_nodes').select('*, skill_domains(*)').eq('id', params.nodeId).single(),
    supabase
      .from('user_skill_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('skill_node_id', params.nodeId)
      .single(),
  ])

  if (!nodeRes.data) redirect('/skill-tree')
  if (progressRes.data?.status === 'locked') redirect('/skill-tree')

  const lesson = getLessonForNode(params.nodeId)

  return (
    <LessonClient
      node={nodeRes.data}
      progress={progressRes.data}
      lesson={lesson}
    />
  )
}
