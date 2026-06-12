// src/lib/engines/mission-engine.ts
// Generates personalized daily/weekly missions based on progress and ROI

import type { UserSkillProgress, SkillNode, Profile, Mission, MissionTask } from '@/types'
import { classifySkillForSprint } from './readiness-engine'

interface MissionGenerationInput {
  profile: Profile
  skillProgress: UserSkillProgress[]
  skillNodes: SkillNode[]
  existingMissions: Mission[]
}

interface GeneratedMission {
  title: string
  description: string
  mission_type: 'daily' | 'weekly' | 'sprint' | 'recovery'
  priority: number
  xp_reward: number
  skill_node_ids: string[]
  tasks: MissionTask[]
  success_criteria: string[]
  estimated_minutes: number
  roi_score: number
  career_impact: string
  ai_leverage_tip: string
}

// Determine the next available skill to work on
function getNextPrioritySkill(
  skillProgress: UserSkillProgress[],
  skillNodes: SkillNode[],
  sprintMode: boolean
): SkillNode | null {
  const availableProgress = skillProgress.filter(sp =>
    sp.status === 'available' || sp.status === 'in_progress'
  )

  const availableNodes = availableProgress
    .map(sp => skillNodes.find(n => n.id === sp.skill_node_id))
    .filter((n): n is SkillNode => n !== undefined)

  if (availableNodes.length === 0) return null

  // Score each available node
  const scored = availableNodes.map(node => {
    const classification = classifySkillForSprint(
      node.id,
      node.career_value_score,
      node.interview_frequency_score,
      node.market_demand_score,
      node.is_sprint_essential
    )

    const classScore = classification === 'must_learn' ? 100 : classification === 'useful_later' ? 50 : 0

    const combinedROI = (
      node.career_value_score * 0.30 +
      node.interview_frequency_score * 0.35 +
      node.market_demand_score * 0.20 +
      classScore * 0.15
    )

    // In sprint mode, boost sprint-essential skills
    const sprintBoost = sprintMode && node.is_sprint_essential ? 20 : 0
    // Prefer in_progress skills
    const progressProgress = skillProgress.find(sp => sp.skill_node_id === node.id)
    const inProgressBoost = progressProgress?.status === 'in_progress' ? 15 : 0

    return {
      node,
      score: combinedROI + sprintBoost + inProgressBoost,
    }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.node ?? null
}

// Generate tasks for a skill node
function generateTasksForSkill(node: SkillNode, progress?: UserSkillProgress): MissionTask[] {
  const tasks: MissionTask[] = []
  const masteryScore = progress?.mastery_score ?? 0

  // If brand new, start with theory
  if (masteryScore < 20) {
    tasks.push({
      id: `task_learn_${node.id}_${Date.now()}`,
      title: `Study: ${node.name}`,
      description: `Complete the lesson for ${node.name}. Focus on understanding the core concept.`,
      task_type: 'learn',
      status: 'pending',
      xp_reward: 30,
      estimated_minutes: Math.round(node.estimated_minutes * 0.3),
    })
  }

  // Practice task
  tasks.push({
    id: `task_practice_${node.id}_${Date.now()}`,
    title: `Practice: ${node.name}`,
    description: `Complete the guided examples and exercises for ${node.name}.`,
    task_type: 'practice',
    status: 'pending',
    xp_reward: 50,
    estimated_minutes: Math.round(node.estimated_minutes * 0.4),
  })

  // Exercise task
  tasks.push({
    id: `task_exercise_${node.id}_${Date.now()}`,
    title: `Exercise: Apply ${node.name}`,
    description: `Solve the hands-on exercise. Do not skip — this is how you retain the skill.`,
    task_type: 'exercise',
    status: 'pending',
    xp_reward: 75,
    estimated_minutes: Math.round(node.estimated_minutes * 0.3),
  })

  // Interview prep for high-frequency skills
  if (node.interview_frequency_score >= 80) {
    tasks.push({
      id: `task_interview_${node.id}_${Date.now()}`,
      title: `Interview Prep: ${node.name}`,
      description: `Review the top interview questions for ${node.name}. Answer in your own words.`,
      task_type: 'interview',
      status: 'pending',
      xp_reward: 40,
      estimated_minutes: 15,
    })
  }

  return tasks
}

// Get AI leverage tip for a skill
function getAILeverageTip(domainId: string): string {
  const tips: Record<string, string> = {
    sql: '💡 AI Leverage: Use Claude to explain your query results and suggest optimizations. Always write the query yourself first — interviewers will test if you can do this without AI.',
    python: '💡 AI Leverage: Use Claude to debug error messages and explain unfamiliar syntax. Practice writing Pandas operations from memory before relying on AI suggestions.',
    pandas: '💡 AI Leverage: Ask Claude to review your data cleaning approach and suggest alternative methods. The logic must be yours — AI helps you polish it.',
    statistics: '💡 AI Leverage: Use Claude to verify your interpretation of statistical results. The judgment of whether findings are significant for a business decision must be yours.',
    business_analytics: '💡 AI Leverage: Claude can help structure your analysis framework. The business insight and recommendation must come from your own understanding of the data.',
    power_bi: '💡 AI Leverage: Use Claude to troubleshoot DAX formulas. Design the dashboard layout and choose metrics yourself — that demonstrates business judgment.',
    interviews: '💡 AI Leverage: Use Claude as your interview partner. Practice answering questions aloud yourself first, then use Claude to evaluate and improve your answers.',
    projects: '💡 AI Leverage: Claude can review your code for bugs and suggest improvements. The analysis narrative and business insights must be entirely yours.',
    resume: '💡 AI Leverage: Use Claude to improve bullet point phrasing and check ATS keywords. The content (your actual experience and metrics) must be real and yours.',
  }
  return tips[domainId] ?? '💡 AI Leverage: Use AI for support and review, not to replace the core thinking. That thinking is what gets you the job.'
}

// Career impact description
function getCareerImpact(node: SkillNode): string {
  const careerImpacts: Record<string, string> = {
    sql_joins: '🎯 Joins appear in 95%+ of DA technical interviews. This single skill unlocks most business analysis questions.',
    sql_window: '🎯 Window functions are a senior-level differentiator. Mastering this puts you ahead of 70% of candidates.',
    pandas_groupby: '🎯 GroupBy + aggregation is the core of Pandas data analysis. This is asked in almost every Python interview.',
    ba_cases: '🎯 Business case frameworks separate analysts from data processors. This is what hiring managers actually want.',
    int_mock_1: '🎯 Your first mock interview reveals gaps you cannot see in practice. Every session increases your offer probability.',
    resume_build: '🎯 A strong resume determines whether you get interviews. This is your marketing document.',
  }
  return careerImpacts[node.id] ??
    `🎯 Career Impact Score: ${node.career_value_score}/100. This skill appears in ${node.interview_frequency_score}% of DA interviews.`
}

// Main mission generation function
export function generateDailyMission(input: MissionGenerationInput): GeneratedMission | null {
  const { profile, skillProgress, skillNodes, existingMissions } = input

  // Check for active missions that aren't completed
  const activeMission = existingMissions.find(m =>
    m.status === 'active' || m.status === 'pending'
  )

  if (activeMission) return null // Don't generate if there's an active mission

  // Get the next priority skill
  const nextSkill = getNextPrioritySkill(skillProgress, skillNodes, profile.sprint_mode_enabled)

  if (!nextSkill) {
    return null
  }

  const existingProgress = skillProgress.find(sp => sp.skill_node_id === nextSkill.id)
  const tasks = generateTasksForSkill(nextSkill, existingProgress)
  const estimatedMinutes = tasks.reduce((sum, t) => sum + t.estimated_minutes, 0)
  const totalXP = tasks.reduce((sum, t) => sum + t.xp_reward, 0) + 50 // bonus for mission completion

  // ROI score
  const roiScore = Math.round(
    nextSkill.career_value_score * 0.35 +
    nextSkill.interview_frequency_score * 0.40 +
    nextSkill.market_demand_score * 0.25
  )

  return {
    title: `Master: ${nextSkill.name}`,
    description: `Today's primary mission: ${nextSkill.description ?? nextSkill.name}. Complete all tasks to unlock the next skill.`,
    mission_type: profile.sprint_mode_enabled ? 'sprint' : 'daily',
    priority: 1,
    xp_reward: totalXP,
    skill_node_ids: [nextSkill.id],
    tasks,
    success_criteria: [
      `Complete all ${tasks.length} tasks`,
      `Achieve minimum 70% on the skill exercise`,
      `Review at least 2 interview questions for this skill`,
    ],
    estimated_minutes: estimatedMinutes,
    roi_score: roiScore,
    career_impact: getCareerImpact(nextSkill),
    ai_leverage_tip: getAILeverageTip(nextSkill.domain_id),
  }
}

// Generate recovery mission when a streak is broken
export function generateRecoveryMission(
  skillProgress: UserSkillProgress[],
  skillNodes: SkillNode[]
): GeneratedMission {
  // Find the most recently active skill
  const recentProgress = skillProgress
    .filter(sp => sp.status === 'in_progress' || sp.last_attempted_at !== null)
    .sort((a, b) => {
      const dateA = new Date(a.last_attempted_at ?? a.created_at).getTime()
      const dateB = new Date(b.last_attempted_at ?? b.created_at).getTime()
      return dateB - dateA
    })

  const recentNode = skillNodes.find(n => n.id === recentProgress[0]?.skill_node_id)

  const tasks: MissionTask[] = [
    {
      id: `recovery_review_${Date.now()}`,
      title: 'Recovery: Quick Review',
      description: 'Review your last completed topic. Spend 15 minutes refreshing your memory.',
      task_type: 'review',
      status: 'pending',
      xp_reward: 25,
      estimated_minutes: 15,
    },
    {
      id: `recovery_practice_${Date.now()}`,
      title: 'Recovery: Practice Exercise',
      description: 'Complete one practice exercise on your current skill.',
      task_type: 'exercise',
      status: 'pending',
      xp_reward: 50,
      estimated_minutes: 20,
    },
  ]

  return {
    title: '⚡ Recovery Mission: Get Back on Track',
    description: 'Your streak was broken. This is a short recovery mission to re-engage. No Zero Days.',
    mission_type: 'recovery',
    priority: 1,
    xp_reward: 100,
    skill_node_ids: recentNode ? [recentNode.id] : [],
    tasks,
    success_criteria: ['Complete both recovery tasks', 'Log at least 30 minutes of study today'],
    estimated_minutes: 35,
    roi_score: 85,
    career_impact: '🔥 Consistency is the #1 predictor of success. One missed day becomes two. Start now.',
    ai_leverage_tip: '💡 Use Claude to get a quick summary of what you reviewed — this reinforces memory consolidation.',
  }
}

// Check if user should unlock next skill
export function checkSkillUnlocks(
  skillProgress: UserSkillProgress[],
  skillNodes: SkillNode[]
): string[] {
  const completedNodeIds = new Set(
    skillProgress
      .filter(sp => sp.status === 'completed' || sp.status === 'mastered')
      .map(sp => sp.skill_node_id)
  )

  const toUnlock: string[] = []

  for (const node of skillNodes) {
    const currentProgress = skillProgress.find(sp => sp.skill_node_id === node.id)
    if (currentProgress?.status !== 'locked') continue

    // Check if all prerequisites are completed
    const prereqsMet = node.prerequisites.every(prereq => completedNodeIds.has(prereq))
    if (prereqsMet) {
      toUnlock.push(node.id)
    }
  }

  return toUnlock
}
