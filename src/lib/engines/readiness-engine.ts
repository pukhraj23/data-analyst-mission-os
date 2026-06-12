// src/lib/engines/readiness-engine.ts
// Calculates internship, job, and interview readiness scores

import type { UserSkillProgress, Project, MockInterviewSession, ReadinessBreakdown } from '@/types'

interface ReadinessInputs {
  skillProgress: UserSkillProgress[]
  projects: Project[]
  mockInterviews: MockInterviewSession[]
  hasResume: boolean
  hasLinkedIn: boolean
  assessmentScores: Array<{ category: string; score: number }>
}

// Domain weights for internship readiness
const INTERNSHIP_WEIGHTS = {
  sql: 0.28,
  python_pandas: 0.20,
  business_analytics: 0.15,
  projects: 0.22,
  interview_prep: 0.10,
  resume_linkedin: 0.05,
}

// Domain weights for job readiness (higher bar)
const JOB_WEIGHTS = {
  sql: 0.22,
  python_pandas: 0.18,
  business_analytics: 0.18,
  projects: 0.20,
  interview_prep: 0.15,
  resume_linkedin: 0.07,
}

// Skills that map to each domain
const DOMAIN_SKILL_MAPPING: Record<string, string[]> = {
  sql: ['sql_select', 'sql_where', 'sql_groupby', 'sql_having', 'sql_joins', 'sql_case', 'sql_subqueries', 'sql_cte', 'sql_window'],
  python_pandas: ['python_basics', 'python_control', 'python_functions', 'python_data_structures', 'pandas_dataframes', 'pandas_selection', 'pandas_cleaning', 'pandas_groupby', 'pandas_merge'],
  business_analytics: ['ba_kpis', 'ba_cases', 'ba_sql_cases', 'stats_descriptive', 'stats_hypothesis'],
  projects: [], // calculated from projects table
  interview_prep: ['int_sql', 'int_pandas', 'int_business', 'int_behavioral'],
  resume_linkedin: ['resume_build', 'resume_optimize', 'linkedin_profile'],
}

function calculateDomainScore(
  domain: string,
  skillProgress: UserSkillProgress[]
): number {
  const domainSkills = DOMAIN_SKILL_MAPPING[domain] ?? []
  if (domainSkills.length === 0) return 0

  const relevantProgress = skillProgress.filter(sp =>
    domainSkills.includes(sp.skill_node_id)
  )

  if (relevantProgress.length === 0) return 0

  // Count completed/mastered skills
  const completedSkills = relevantProgress.filter(sp =>
    sp.status === 'completed' || sp.status === 'mastered'
  )

  // Weighted by mastery score
  const masteryScore = completedSkills.reduce((sum, sp) => sum + sp.mastery_score, 0)
  const maxPossible = domainSkills.length * 100

  return Math.min(100, Math.round((masteryScore / maxPossible) * 100))
}

function calculateProjectsScore(projects: Project[]): number {
  if (projects.length === 0) return 0

  const completedProjects = projects.filter(p => p.status === 'completed')
  if (completedProjects.length === 0) {
    const inProgress = projects.filter(p => p.status === 'in_progress')
    return Math.round(inProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / 3)
  }

  const avgScore = completedProjects.reduce((sum, p) => sum + (p.hiring_manager_score ?? 70), 0) / completedProjects.length
  const completionBonus = Math.min(30, completedProjects.length * 10)
  return Math.min(100, Math.round(avgScore + completionBonus))
}

function calculateInterviewReadiness(
  mockInterviews: MockInterviewSession[],
  skillProgress: UserSkillProgress[]
): number {
  const completedSessions = mockInterviews.filter(s => s.status === 'completed')

  // Base score from interview skill progress
  const interviewSkills = DOMAIN_SKILL_MAPPING.interview_prep
  const interviewProgress = skillProgress.filter(sp => interviewSkills.includes(sp.skill_node_id))
  const skillScore = interviewProgress.filter(sp => sp.status === 'completed' || sp.status === 'mastered').length / interviewSkills.length * 60

  // Mock interview bonus
  let mockScore = 0
  if (completedSessions.length > 0) {
    const avgScore = completedSessions.reduce((sum, s) => sum + (s.overall_score ?? 0), 0) / completedSessions.length
    mockScore = avgScore * 0.4
  }

  return Math.min(100, Math.round(skillScore + mockScore))
}

export function calculateReadinessBreakdown(inputs: ReadinessInputs): ReadinessBreakdown {
  const { skillProgress, projects, mockInterviews, hasResume, hasLinkedIn, assessmentScores } = inputs

  // Calculate domain scores
  const sqlScore = calculateDomainScore('sql', skillProgress)
  const pythonScore = calculateDomainScore('python_pandas', skillProgress)
  const statsScore = calculateDomainScore('business_analytics', skillProgress)
  const baScore = statsScore
  const projectsScore = calculateProjectsScore(projects)
  const interviewScore = calculateInterviewReadiness(mockInterviews, skillProgress)
  const resumeScore = (hasResume ? 50 : 0) + (hasLinkedIn ? 50 : 0)

  // Internship readiness
  const internshipScore = Math.round(
    sqlScore * INTERNSHIP_WEIGHTS.sql +
    pythonScore * INTERNSHIP_WEIGHTS.python_pandas +
    baScore * INTERNSHIP_WEIGHTS.business_analytics +
    projectsScore * INTERNSHIP_WEIGHTS.projects +
    interviewScore * INTERNSHIP_WEIGHTS.interview_prep +
    resumeScore * INTERNSHIP_WEIGHTS.resume_linkedin
  )

  // Job readiness (higher bar, needs everything polished)
  const jobScore = Math.round(
    sqlScore * JOB_WEIGHTS.sql +
    pythonScore * JOB_WEIGHTS.python_pandas +
    baScore * JOB_WEIGHTS.business_analytics +
    projectsScore * JOB_WEIGHTS.projects +
    interviewScore * JOB_WEIGHTS.interview_prep +
    resumeScore * JOB_WEIGHTS.resume_linkedin
  ) * 0.9 // 10% harder to reach

  // Probability calculations (non-linear)
  const internshipProbability = Math.min(95, Math.round(
    internshipScore >= 80 ? 70 + (internshipScore - 80) * 1.25 :
    internshipScore >= 60 ? 35 + (internshipScore - 60) * 1.75 :
    internshipScore >= 40 ? 10 + (internshipScore - 40) * 1.25 :
    internshipScore * 0.25
  ))

  const interviewProbability = Math.min(90, Math.round(
    interviewScore >= 70 ? 60 + (interviewScore - 70) * 1.0 :
    interviewScore >= 50 ? 30 + (interviewScore - 50) * 1.5 :
    interviewScore * 0.6
  ))

  const jobOfferProbability = Math.min(85, Math.round(jobScore * 0.8))

  // Gap analysis
  const gaps: ReadinessBreakdown['gaps'] = []

  if (sqlScore < 80) {
    gaps.push({
      skill: 'SQL',
      currentScore: sqlScore,
      requiredScore: 80,
      priority: sqlScore < 40 ? 'critical' : 'high',
      estimatedHours: Math.round((80 - sqlScore) * 0.5)
    })
  }

  if (pythonScore < 70) {
    gaps.push({
      skill: 'Python / Pandas',
      currentScore: pythonScore,
      requiredScore: 70,
      priority: pythonScore < 30 ? 'critical' : 'high',
      estimatedHours: Math.round((70 - pythonScore) * 0.6)
    })
  }

  if (projectsScore < 60) {
    gaps.push({
      skill: 'Portfolio Projects',
      currentScore: projectsScore,
      requiredScore: 60,
      priority: 'high',
      estimatedHours: Math.round((60 - projectsScore) * 1.5)
    })
  }

  if (interviewScore < 65) {
    gaps.push({
      skill: 'Interview Preparation',
      currentScore: interviewScore,
      requiredScore: 65,
      priority: interviewScore < 30 ? 'high' : 'medium',
      estimatedHours: Math.round((65 - interviewScore) * 0.5)
    })
  }

  if (baScore < 60) {
    gaps.push({
      skill: 'Business Analytics',
      currentScore: baScore,
      requiredScore: 60,
      priority: 'medium',
      estimatedHours: Math.round((60 - baScore) * 0.7)
    })
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  // Determine top ROI action
  const topROIAction = determineTopROIAction(gaps, inputs)

  return {
    overall: internshipScore,
    sql: sqlScore,
    python: pythonScore,
    statistics: statsScore,
    businessAnalytics: baScore,
    projects: projectsScore,
    resume: resumeScore,
    interviews: interviewScore,
    probability: {
      internship: internshipProbability,
      interview: interviewProbability,
      jobOffer: jobOfferProbability,
    },
    gaps,
    topROIAction,
  }
}

function determineTopROIAction(
  gaps: ReadinessBreakdown['gaps'],
  inputs: ReadinessInputs
): string {
  const { projects, mockInterviews } = inputs

  const criticalGap = gaps.find(g => g.priority === 'critical')
  if (criticalGap) {
    return `Complete ${criticalGap.skill} fundamentals — this is your #1 blocker for internship readiness`
  }

  const noProjects = projects.filter(p => p.status === 'completed').length === 0
  if (noProjects) {
    return 'Start your SQL Business Analysis Project — portfolio projects are the #1 differentiator for internship applicants'
  }

  const noMockInterviews = mockInterviews.filter(s => s.status === 'completed').length === 0
  const sqlGap = gaps.find(g => g.skill === 'SQL')
  if (!noProjects && !sqlGap && noMockInterviews) {
    return 'Complete your first Mock Interview — skills without interview practice do not convert to offers'
  }

  const highGap = gaps.find(g => g.priority === 'high')
  if (highGap) {
    return `Improve ${highGap.skill} from ${highGap.currentScore}% to ${highGap.requiredScore}% — ${highGap.estimatedHours}h estimated`
  }

  return 'Practice SQL interview questions daily — consistent repetition builds the pattern recognition that passes technical screens'
}

// Sprint mode classifier
export function classifySkillForSprint(
  skillNodeId: string,
  careerValueScore: number,
  interviewFrequencyScore: number,
  marketDemandScore: number,
  isSprintEssential: boolean
): 'must_learn' | 'useful_later' | 'ignore_for_now' {
  const combinedScore = (
    careerValueScore * 0.35 +
    interviewFrequencyScore * 0.40 +
    marketDemandScore * 0.25
  )

  if (isSprintEssential && combinedScore >= 80) return 'must_learn'
  if (combinedScore >= 75) return 'must_learn'
  if (combinedScore >= 55) return 'useful_later'
  return 'ignore_for_now'
}

// Estimate weeks to internship ready
export function estimateWeeksToInternshipReady(
  currentScore: number,
  dailyStudyMinutes: number
): number {
  const gapToReady = Math.max(0, 80 - currentScore)
  if (gapToReady === 0) return 0

  // Rough heuristic: 1 readiness point ≈ 45 minutes of focused study
  const totalMinutesNeeded = gapToReady * 45
  const weeklyMinutes = dailyStudyMinutes * 6 // 6 days/week
  return Math.ceil(totalMinutesNeeded / weeklyMinutes)
}
