'use client'
// src/components/dashboard/DashboardClient.tsx
import { useState, useEffect, useCallback } from 'react'
import { useAppStore, useAwardXP } from '@/lib/store'
import { ReadinessGauge } from './ReadinessGauge'
import { TodayMissionCard } from './TodayMissionCard'
import { XPLevelBar } from './XPLevelBar'
import { StreakCard } from './StreakCard'
import { CareerGPSCard } from './CareerGPSCard'
import { ReadinessBreakdownCard } from './ReadinessBreakdownCard'
import { MarketIntelCard } from './MarketIntelCard'
import { ActivityHeatmap } from './ActivityHeatmap'
import { RecentAchievements } from './RecentAchievements'
import type {
  Profile, Mission, UserSkillProgress, DailyActivity,
  ReadinessSnapshot, UserAchievement, MarketIntelligence
} from '@/types'
import { getReadinessColor, formatMinutes } from '@/lib/utils'
import { calculateReadinessBreakdown, estimateWeeksToInternshipReady } from '@/lib/engines/readiness-engine'
import { getLevelForXP } from '@/lib/engines/xp-engine'
import { RefreshCw, Zap } from 'lucide-react'

interface DashboardClientProps {
  profile: Profile | null
  todayMissions: Mission[]
  skillProgress: UserSkillProgress[]
  recentActivity: DailyActivity[]
  latestSnapshot: ReadinessSnapshot | null
  recentAchievements: UserAchievement[]
  marketIntelligence: MarketIntelligence[]
}

export function DashboardClient({
  profile: initialProfile,
  todayMissions,
  skillProgress,
  recentActivity,
  latestSnapshot,
  recentAchievements,
  marketIntelligence,
}: DashboardClientProps) {
  const { setProfile, setSkillProgress, setReadinessBreakdown } = useAppStore()
  const awardXP = useAwardXP()

  const [missions, setMissions] = useState<Mission[]>(todayMissions)
  const [generating, setGenerating] = useState(false)

  // Hydrate store
  useEffect(() => {
    if (initialProfile) setProfile(initialProfile)
    setSkillProgress(skillProgress)
  }, []) // eslint-disable-line

  // Compute readiness breakdown
  const breakdown = initialProfile ? calculateReadinessBreakdown({
    skillProgress,
    projects: [],
    mockInterviews: [],
    hasResume: skillProgress.some(s => s.skill_node_id === 'resume_build' && s.status !== 'locked'),
    hasLinkedIn: skillProgress.some(s => s.skill_node_id === 'linkedin_profile' && s.status !== 'locked'),
    assessmentScores: [],
  }) : null

  useEffect(() => {
    if (breakdown) setReadinessBreakdown(breakdown)
  }, []) // eslint-disable-line

  const profile = initialProfile
  const level = profile ? getLevelForXP(profile.total_xp) : null
  const weeksToReady = breakdown && profile
    ? estimateWeeksToInternshipReady(breakdown.overall, profile.study_goal_minutes_per_day)
    : null

  async function generateMission() {
    setGenerating(true)
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setMissions(prev => [...prev, data.data])
      }
    } finally {
      setGenerating(false)
    }
  }

  async function completeTask(missionId: string, taskId: string, xpReward: number) {
    const res = await fetch('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete_task', missionId, taskId }),
    })
    const data = await res.json()
    if (data.success) {
      // Update local state
      setMissions(prev =>
        prev.map(m =>
          m.id === missionId
            ? {
                ...m,
                tasks: m.tasks.map(t => t.id === taskId ? { ...t, status: 'completed' as const } : t),
                status: data.data.missionCompleted ? 'completed' : m.status,
              }
            : m
        )
      )
      // Award XP
      await awardXP(xpReward, 'task_complete', taskId, `Task completed`)
      if (data.data.missionCompleted) {
        await awardXP(50, 'mission_complete', missionId, 'Mission completed')
      }
    }
  }

  const activeMission = missions.find(m => m.status === 'active' || m.status === 'pending')
  const todayXP = recentActivity[0]?.xp_earned ?? 0
  const todayMinutes = recentActivity[0]?.time_spent_minutes ?? 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Mission Control
            {profile?.current_streak && profile.current_streak > 0 && (
              <span className="ml-3 text-base font-mono text-orange-400">
                🔥 {profile.current_streak}d
              </span>
            )}
          </h1>
          <p className="text-[#8892A4] text-sm mt-0.5 font-mono">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {weeksToReady !== null && weeksToReady > 0 && (
              <span className="ml-2" style={{ color: getReadinessColor(breakdown?.overall ?? 0) }}>
                · ~{weeksToReady}w to internship-ready
              </span>
            )}
            {weeksToReady === 0 && (
              <span className="ml-2 text-[#39FF14]">· Internship Ready! 🎯</span>
            )}
          </p>
        </div>

        {/* Today stats */}
        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="text-lg font-bold font-mono text-[#00D4FF]">+{todayXP}</div>
            <div className="text-xs text-[#8892A4] font-mono">XP today</div>
          </div>
          {todayMinutes > 0 && (
            <div>
              <div className="text-lg font-bold font-mono text-[#39FF14]">{formatMinutes(todayMinutes)}</div>
              <div className="text-xs text-[#8892A4] font-mono">studied</div>
            </div>
          )}
        </div>
      </div>

      {/* Top row: Readiness + Level + Streak */}
      <div className="grid grid-cols-12 gap-4">
        {/* Readiness gauge */}
        <div className="col-span-12 md:col-span-3">
          <ReadinessGauge
            internshipScore={breakdown?.overall ?? profile?.internship_readiness_score ?? 0}
            jobScore={breakdown?.probability.jobOffer ?? profile?.job_readiness_score ?? 0}
            interviewScore={breakdown?.interviews ?? profile?.interview_readiness_score ?? 0}
          />
        </div>

        {/* XP + Level bar */}
        <div className="col-span-12 md:col-span-5">
          <XPLevelBar profile={profile} level={level} />
        </div>

        {/* Streak card */}
        <div className="col-span-12 md:col-span-4">
          <StreakCard
            currentStreak={profile?.current_streak ?? 0}
            longestStreak={profile?.longest_streak ?? 0}
            activity={recentActivity}
          />
        </div>
      </div>

      {/* Career GPS */}
      {breakdown && (
        <CareerGPSCard
          topROIAction={breakdown.topROIAction}
          gaps={breakdown.gaps}
          weeksToReady={weeksToReady ?? 0}
        />
      )}

      {/* Main content: Mission + Breakdown */}
      <div className="grid grid-cols-12 gap-4">
        {/* Today's Mission */}
        <div className="col-span-12 lg:col-span-7">
          {activeMission ? (
            <TodayMissionCard
              mission={activeMission}
              onCompleteTask={completeTask}
            />
          ) : (
            <div className="mission-card p-6 flex flex-col items-center justify-center gap-4 min-h-[200px]">
              <div className="text-center">
                <div className="text-3xl mb-2">
                  {missions.some(m => m.status === 'completed') ? '✅' : '🎯'}
                </div>
                <h3 className="text-white font-semibold mb-1">
                  {missions.some(m => m.status === 'completed')
                    ? "Today's Mission Complete!"
                    : 'No Mission Yet'}
                </h3>
                <p className="text-[#8892A4] text-sm">
                  {missions.some(m => m.status === 'completed')
                    ? 'Excellent work. Generate tomorrow\'s mission or review your progress.'
                    : 'Generate your daily mission to start earning XP.'}
                </p>
              </div>
              <button
                onClick={generateMission}
                disabled={generating}
                className="flex items-center gap-2 bg-[#00D4FF] hover:bg-[#00B8E0] text-[#0A0F1E] font-semibold rounded-lg px-5 py-2.5 text-sm transition-all disabled:opacity-60"
                style={{ boxShadow: '0 0 16px rgba(0,212,255,0.4)' }}
              >
                {generating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Generate Today's Mission
              </button>
            </div>
          )}
        </div>

        {/* Readiness Breakdown */}
        <div className="col-span-12 lg:col-span-5">
          {breakdown && <ReadinessBreakdownCard breakdown={breakdown} />}
        </div>
      </div>

      {/* Bottom row: Heatmap + Achievements + Market */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6">
          <ActivityHeatmap activity={recentActivity} />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <RecentAchievements achievements={recentAchievements} />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <MarketIntelCard data={marketIntelligence} />
        </div>
      </div>
    </div>
  )
}
