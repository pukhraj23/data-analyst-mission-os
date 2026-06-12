// src/app/interviews/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InterviewsClient } from '@/components/interviews/InterviewsClient'

export const dynamic = 'force-dynamic'

export default async function InterviewsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [questionsRes, attemptsRes, sessionsRes] = await Promise.all([
    supabase.from('interview_questions').select('*').order('frequency_score', { ascending: false }),
    supabase.from('user_interview_attempts').select('*').eq('user_id', user.id),
    supabase.from('mock_interview_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  return (
    <InterviewsClient
      questions={questionsRes.data ?? []}
      attempts={attemptsRes.data ?? []}
      sessions={sessionsRes.data ?? []}
    />
  )
}
