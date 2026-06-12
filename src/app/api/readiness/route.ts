// src/app/api/readiness/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { calculateReadinessBreakdown, estimateWeeksToInternshipReady } from '@/lib/engines/readiness-engine'
import type { UserSkillProgress, Project, MockInterviewSession } from '@/types'

export async function GET(request: NextRequest) {
  const supabase = createRouteClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch all required data
  const [profileResult, progressResult, projectsResult, mockResult, assessmentResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_skill_progress').select('*').eq('user_id', user.id),
    supabase.from('projects').select('*').eq('user_id', user.id),
    supabase.from('mock_interview_sessions').select('*').eq('user_id', user.id),
    supabase.from('user_assessment_results').select('skill_node_id, percentage').eq('user_id', user.id),
  ])

  if (profileResult.error) return NextResponse.json({ error: profileResult.error.message }, { status: 500 })

  const profile = profileResult.data
  const skillProgress = (progressResult.data ?? []) as UserSkillProgress[]
  const projects = (projectsResult.data ?? []) as Project[]
  const mockInterviews = (mockResult.data ?? []) as MockInterviewSession[]
  const assessmentScores = (assessmentResult.data ?? []).map(a => ({
    category: a.skill_node_id ?? '',
    score: a.percentage ?? 0,
  }))

  // Check resume/linkedin
  const hasResume = skillProgress.some(sp =>
    sp.skill_node_id === 'resume_build' &&
    (sp.status === 'completed' || sp.status === 'mastered')
  )
  const hasLinkedIn = skillProgress.some(sp =>
    sp.skill_node_id === 'linkedin_profile' &&
    (sp.status === 'completed' || sp.status === 'mastered')
  )

  const breakdown = calculateReadinessBreakdown({
    skillProgress,
    projects,
    mockInterviews,
    hasResume,
    hasLinkedIn,
    assessmentScores,
  })

  const weeksToReady = estimateWeeksToInternshipReady(
    breakdown.overall,
    profile.study_goal_minutes_per_day
  )

  // Update profile readiness scores
  await supabase
    .from('profiles')
    .update({
      internship_readiness_score: breakdown.overall,
      job_readiness_score: Math.round(breakdown.overall * 0.85),
      interview_readiness_score: breakdown.interviews,
    })
    .eq('id', user.id)

  // Save readiness snapshot (once per day)
  const today = new Date().toISOString().split('T')[0]
  const { data: existingSnapshot } = await supabase
    .from('readiness_snapshots')
    .select('id')
    .eq('user_id', user.id)
    .eq('snapshot_date', today)
    .single()

  if (!existingSnapshot) {
    await supabase.from('readiness_snapshots').insert({
      user_id: user.id,
      internship_readiness: breakdown.overall,
      job_readiness: Math.round(breakdown.overall * 0.85),
      interview_readiness: breakdown.interviews,
      internship_probability: breakdown.probability.internship,
      job_probability: breakdown.probability.jobOffer,
      skills_score: Math.round((breakdown.sql + breakdown.python) / 2),
      projects_score: breakdown.projects,
      interview_score: breakdown.interviews,
      resume_score: breakdown.resume,
      snapshot_date: today,
    })
  }

  return NextResponse.json({
    data: { breakdown, weeksToReady },
    success: true
  })
}
