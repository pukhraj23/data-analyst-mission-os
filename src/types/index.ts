// ============================================================
// DATA ANALYST MISSION OS — Core TypeScript Types
// ============================================================

// ---------------------- USER / PROFILE ----------------------

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  current_level: number
  total_xp: number
  current_xp: number
  xp_to_next_level: number
  current_streak: number
  longest_streak: number
  last_active_date: string | null
  sprint_mode_enabled: boolean
  focus_mode_enabled: boolean
  internship_readiness_score: number
  job_readiness_score: number
  interview_readiness_score: number
  total_time_invested_minutes: number
  study_goal_minutes_per_day: number
  target_internship_date: string | null
  timezone: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Level {
  id: number
  name: string
  title: string
  min_xp: number
  max_xp: number
  badge_color: string
  description: string | null
  unlock_message: string | null
}

// ---------------------- SKILLS ----------------------

export type SkillStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'mastered'

export interface SkillDomain {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  sort_order: number
  phase: number
  is_sprint_priority: boolean
  market_demand_score: number
}

export interface AILeverageGuide {
  do_yourself: string[]
  use_claude: string[]
  use_chatgpt: string[]
  never_delegate: string[]
  can_automate: string[]
  highest_roi: string
  waste_of_time: string
  top_performer_workflow: string
}

export interface LessonContent {
  theory: string
  key_concepts: string[]
  examples: Array<{
    title: string
    code?: string
    explanation: string
  }>
  exercises: Array<{
    id: string
    prompt: string
    starter_code?: string
    solution?: string
    hint?: string
  }>
  business_case?: {
    scenario: string
    questions: string[]
    solution: string
  }
  summary: string
}

export interface SkillNode {
  id: string
  domain_id: string
  name: string
  description: string | null
  sort_order: number
  xp_reward: number
  estimated_minutes: number
  difficulty: number
  career_value_score: number
  interview_frequency_score: number
  market_demand_score: number
  ai_automation_score: number
  prerequisites: string[]
  learning_content: LessonContent | null
  exercises: unknown
  interview_questions: unknown
  ai_leverage_guide: AILeverageGuide | null
  is_sprint_essential: boolean
  created_at: string
}

export interface UserSkillProgress {
  id: string
  user_id: string
  skill_node_id: string
  status: SkillStatus
  mastery_score: number
  attempts: number
  correct_answers: number
  xp_earned: number
  time_spent_minutes: number
  started_at: string | null
  completed_at: string | null
  last_attempted_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SkillNodeWithProgress extends SkillNode {
  progress?: UserSkillProgress
  domain?: SkillDomain
}

// ---------------------- MISSIONS ----------------------

export type MissionType = 'daily' | 'weekly' | 'project' | 'sprint' | 'recovery' | 'interview'
export type MissionStatus = 'pending' | 'active' | 'completed' | 'failed' | 'skipped'

export interface MissionTask {
  id: string
  title: string
  description: string
  task_type: 'learn' | 'practice' | 'exercise' | 'project' | 'interview' | 'review'
  status: 'pending' | 'active' | 'completed' | 'skipped'
  xp_reward: number
  estimated_minutes: number
  content?: unknown
}

export interface Mission {
  id: string
  user_id: string
  title: string
  description: string
  mission_type: MissionType
  status: MissionStatus
  priority: number
  xp_reward: number
  skill_node_ids: string[]
  tasks: MissionTask[]
  success_criteria: string[]
  estimated_minutes: number
  actual_minutes: number | null
  roi_score: number
  career_impact: string | null
  ai_leverage_tip: string | null
  scheduled_date: string | null
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

// ---------------------- XP SYSTEM ----------------------

export interface XPTransaction {
  id: string
  user_id: string
  amount: number
  transaction_type: string
  reference_id: string | null
  description: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface XPGain {
  amount: number
  type: string
  description: string
  leveledUp?: boolean
  newLevel?: number
  newLevelTitle?: string
  achievementsUnlocked?: Achievement[]
}

// ---------------------- PROJECTS ----------------------

export type ProjectType = 'sql_analysis' | 'python_eda' | 'dashboard' | 'custom'
export type ProjectStatus = 'not_started' | 'in_progress' | 'review' | 'completed'

export interface Project {
  id: string
  user_id: string
  project_type: ProjectType
  title: string
  description: string | null
  status: ProjectStatus
  completion_percentage: number
  skills_used: string[]
  github_url: string | null
  demo_url: string | null
  hiring_manager_score: number | null
  recruiter_keywords: string[]
  project_content: Record<string, unknown>
  feedback: unknown[]
  xp_earned: number
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

// ---------------------- INTERVIEWS ----------------------

export type InterviewCategory = 'sql' | 'excel' | 'python' | 'pandas' | 'statistics' | 'business_case' | 'behavioral' | 'general'

export interface InterviewQuestion {
  id: string
  category: InterviewCategory
  difficulty: number
  question: string
  sample_answer: string | null
  key_points: string[] | null
  common_mistakes: string[] | null
  follow_up_questions: string[] | null
  companies: string[] | null
  frequency_score: number
  created_at: string
}

export interface UserInterviewAttempt {
  id: string
  user_id: string
  question_id: string
  session_id: string | null
  user_answer: string | null
  ai_feedback: string | null
  score: number | null
  confidence_level: number | null
  next_review_date: string | null
  interval_days: number
  ease_factor: number
  created_at: string
}

export interface MockInterviewSession {
  id: string
  user_id: string
  session_type: 'sql' | 'python' | 'business_case' | 'behavioral' | 'full'
  status: 'in_progress' | 'completed' | 'abandoned'
  overall_score: number | null
  questions_asked: number
  questions_passed: number
  duration_minutes: number | null
  ai_feedback: string | null
  strengths: string[] | null
  improvements: string[] | null
  readiness_impact: number
  xp_earned: number
  created_at: string
  completed_at: string | null
}

// ---------------------- ASSESSMENTS ----------------------

export interface AssessmentQuestion {
  id: string
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'code'
  question: string
  options?: string[]
  correct_answer?: string | number
  points: number
  explanation?: string
}

export interface Assessment {
  id: string
  skill_node_id: string
  title: string
  description: string | null
  assessment_type: 'quiz' | 'coding' | 'business_case' | 'mock_interview' | 'project_review'
  difficulty: number
  time_limit_minutes: number
  passing_score: number
  questions: AssessmentQuestion[]
  created_at: string
}

export interface AssessmentResult {
  id: string
  user_id: string
  assessment_id: string
  skill_node_id: string | null
  score: number
  max_score: number
  percentage: number
  passed: boolean
  time_taken_minutes: number | null
  answers: Record<string, unknown>
  feedback: string | null
  weak_areas: string[] | null
  xp_earned: number
  attempt_number: number
  created_at: string
}

// ---------------------- ACHIEVEMENTS ----------------------

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string | null
  badge_color: string
  xp_reward: number
  condition_type: string | null
  condition_value: number | null
  condition_data: Record<string, unknown>
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  xp_awarded: number
  achievement?: Achievement
}

// ---------------------- ANALYTICS ----------------------

export interface DailyActivity {
  id: string
  user_id: string
  date: string
  xp_earned: number
  time_spent_minutes: number
  tasks_completed: number
  missions_completed: number
  skills_practiced: string[]
  internship_score_delta: number
  job_score_delta: number
  streak_day: number
  created_at: string
}

export interface ReadinessSnapshot {
  id: string
  user_id: string
  internship_readiness: number
  job_readiness: number
  interview_readiness: number
  internship_probability: number
  job_probability: number
  skills_score: number
  projects_score: number
  interview_score: number
  resume_score: number
  snapshot_date: string
  created_at: string
}

// ---------------------- AI COACH ----------------------

export interface CoachMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface CoachConversation {
  id: string
  user_id: string
  session_type: 'general' | 'lesson' | 'exercise' | 'interview' | 'project' | 'career'
  context_skill_id: string | null
  context_mission_id: string | null
  messages: CoachMessage[]
  summary: string | null
  insights_extracted: unknown[]
  created_at: string
  updated_at: string
}

// ---------------------- MARKET INTELLIGENCE ----------------------

export interface MarketIntelligence {
  id: string
  skill_name: string
  demand_score: number
  trend: 'rising' | 'stable' | 'declining'
  job_count_estimate: number | null
  avg_salary_usd: number | null
  top_companies: string[] | null
  common_job_titles: string[] | null
  data_source: string
  last_updated: string
}

// ---------------------- DASHBOARD ----------------------

export interface DashboardData {
  profile: Profile
  currentLevel: Level
  todayMission: Mission | null
  weeklyMissions: Mission[]
  recentActivity: DailyActivity[]
  readinessSnapshot: ReadinessSnapshot | null
  skillProgress: UserSkillProgress[]
  recentXP: XPTransaction[]
  nextSkillToUnlock: SkillNode | null
  topROIAction: string
  estimatedWeeksToReady: number
  achievements: UserAchievement[]
  marketIntelligence: MarketIntelligence[]
}

// ---------------------- READINESS SCORING ----------------------

export interface ReadinessBreakdown {
  overall: number
  sql: number
  python: number
  statistics: number
  businessAnalytics: number
  projects: number
  resume: number
  interviews: number
  probability: {
    internship: number
    interview: number
    jobOffer: number
  }
  gaps: Array<{
    skill: string
    currentScore: number
    requiredScore: number
    priority: 'critical' | 'high' | 'medium' | 'low'
    estimatedHours: number
  }>
  topROIAction: string
}

// ---------------------- SPRINT MODE ----------------------

export interface SprintTask {
  skillNodeId: string
  skillName: string
  domain: string
  priority: number
  roiScore: number
  careerValueScore: number
  marketDemandScore: number
  interviewFrequencyScore: number
  estimatedMinutes: number
  isSprintEssential: boolean
  classification: 'must_learn' | 'useful_later' | 'ignore_for_now'
}

// ---------------------- API RESPONSES ----------------------

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  hasMore: boolean
}
