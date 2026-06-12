// src/lib/engines/xp-engine.ts
// Handles all XP calculations, level-up logic, and achievement checking

import type { Profile, Level, XPGain, Achievement, UserAchievement } from '@/types'

export const LEVELS: Level[] = [
  { id: 1, name: 'beginner', title: 'Beginner', min_xp: 0, max_xp: 499, badge_color: '#6B7280', description: 'Just getting started', unlock_message: 'Welcome to your Data Analyst journey!' },
  { id: 2, name: 'sql_apprentice', title: 'SQL Apprentice', min_xp: 500, max_xp: 1499, badge_color: '#3B82F6', description: 'Data querying foundations', unlock_message: 'SQL foundations unlocked! Keep going.' },
  { id: 3, name: 'data_explorer', title: 'Data Explorer', min_xp: 1500, max_xp: 3499, badge_color: '#8B5CF6', description: 'Exploring and analyzing datasets', unlock_message: 'Python & Pandas unlocked! You\'re building real skills.' },
  { id: 4, name: 'business_analyst', title: 'Business Analyst', min_xp: 3500, max_xp: 6999, badge_color: '#F59E0B', description: 'Translating data to business insights', unlock_message: 'Business Analytics unlocked! Hiring managers notice this.' },
  { id: 5, name: 'data_analyst', title: 'Data Analyst', min_xp: 7000, max_xp: 12999, badge_color: '#10B981', description: 'Core Data Analyst skill set', unlock_message: 'Portfolio projects unlocked! Build what gets you hired.' },
  { id: 6, name: 'internship_ready', title: 'Internship Ready', min_xp: 13000, max_xp: 22999, badge_color: '#00D4FF', description: 'Ready for internship interviews', unlock_message: '🎯 INTERNSHIP SPRINT COMPLETE! Apply now.' },
  { id: 7, name: 'job_ready', title: 'Job Ready', min_xp: 23000, max_xp: 999999, badge_color: '#39FF14', description: 'Ready for full-time positions', unlock_message: '🚀 JOB READY! You have achieved full Data Analyst competency.' },
]

export function getLevelForXP(totalXP: number): Level {
  return LEVELS.find(l => totalXP >= l.min_xp && totalXP <= l.max_xp) ?? LEVELS[0]
}

export function getXPToNextLevel(totalXP: number): number {
  const currentLevel = getLevelForXP(totalXP)
  if (currentLevel.id === LEVELS.length) return 0
  const nextLevel = LEVELS.find(l => l.id === currentLevel.id + 1)
  if (!nextLevel) return 0
  return nextLevel.min_xp - totalXP
}

export function getLevelProgress(totalXP: number): number {
  const currentLevel = getLevelForXP(totalXP)
  const levelRange = currentLevel.max_xp - currentLevel.min_xp
  const userProgress = totalXP - currentLevel.min_xp
  return Math.min(100, Math.round((userProgress / levelRange) * 100))
}

export interface XPAwardResult {
  newTotalXP: number
  newCurrentXP: number
  xpToNextLevel: number
  leveledUp: boolean
  oldLevel: Level
  newLevel: Level
  progressPercent: number
}

export function calculateXPAward(
  currentTotalXP: number,
  xpToAdd: number
): XPAwardResult {
  const oldLevel = getLevelForXP(currentTotalXP)
  const newTotalXP = currentTotalXP + xpToAdd
  const newLevel = getLevelForXP(newTotalXP)
  const leveledUp = newLevel.id > oldLevel.id

  return {
    newTotalXP,
    newCurrentXP: newTotalXP - newLevel.min_xp,
    xpToNextLevel: getXPToNextLevel(newTotalXP),
    leveledUp,
    oldLevel,
    newLevel,
    progressPercent: getLevelProgress(newTotalXP),
  }
}

// XP multipliers based on context
export const XP_MULTIPLIERS = {
  streak_7: 1.25,
  streak_14: 1.5,
  streak_30: 2.0,
  sprint_mode: 1.1,
  first_attempt: 1.2,
  perfect_score: 1.5,
  daily_goal_reached: 1.1,
}

export function calculateTaskXP(
  baseXP: number,
  context: {
    streakDays?: number
    sprintMode?: boolean
    isFirstAttempt?: boolean
    score?: number // 0-100
  }
): number {
  let multiplier = 1.0

  if (context.streakDays && context.streakDays >= 30) multiplier *= XP_MULTIPLIERS.streak_30
  else if (context.streakDays && context.streakDays >= 14) multiplier *= XP_MULTIPLIERS.streak_14
  else if (context.streakDays && context.streakDays >= 7) multiplier *= XP_MULTIPLIERS.streak_7

  if (context.sprintMode) multiplier *= XP_MULTIPLIERS.sprint_mode
  if (context.isFirstAttempt) multiplier *= XP_MULTIPLIERS.first_attempt
  if (context.score && context.score >= 90) multiplier *= XP_MULTIPLIERS.perfect_score

  return Math.round(baseXP * multiplier)
}

// Streak logic
export function calculateStreak(
  lastActiveDate: string | null,
  currentStreak: number
): { newStreak: number; streakBroken: boolean; isNewDay: boolean } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (!lastActiveDate) {
    return { newStreak: 1, streakBroken: false, isNewDay: true }
  }

  const lastActive = new Date(lastActiveDate)
  lastActive.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return { newStreak: currentStreak, streakBroken: false, isNewDay: false }
  } else if (diffDays === 1) {
    return { newStreak: currentStreak + 1, streakBroken: false, isNewDay: true }
  } else {
    return { newStreak: 1, streakBroken: true, isNewDay: true }
  }
}

// Streak bonus XP
export function getStreakBonusXP(streak: number): number {
  if (streak >= 30) return 100
  if (streak >= 14) return 50
  if (streak >= 7) return 25
  if (streak >= 3) return 10
  return 0
}

// Mission XP rewards by type
export const MISSION_XP_REWARDS = {
  task_complete: 25,
  lesson_complete: 50,
  exercise_complete: 75,
  assessment_pass: 150,
  project_milestone: 200,
  project_complete: 500,
  mock_interview_complete: 250,
  mock_interview_pass: 400,
  skill_node_complete: 100,
  skill_node_mastered: 200,
  daily_mission_complete: 150,
  weekly_mission_complete: 500,
  streak_3: 30,
  streak_7: 75,
  streak_14: 150,
  streak_30: 400,
  level_up: 0, // No XP for level up itself, it's a milestone
}
