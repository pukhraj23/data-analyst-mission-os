'use client'
// src/components/missions/MissionsClient.tsx
import { useState } from 'react'
import type { Mission } from '@/types'
import { TodayMissionCard } from '@/components/dashboard/TodayMissionCard'
import { useAwardXP } from '@/lib/store'
import { cn, calculateCompletionPercentage, formatMinutes, timeAgo } from '@/lib/utils'
import { RefreshCw, Zap, Target, CheckCircle2, XCircle, Clock } from 'lucide-react'

interface Props { initialMissions: Mission[] }

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  completed: { label: 'COMPLETE', cls: 'bg-[#39FF1415] text-[#39FF14] border-[#39FF1430]' },
  active: { label: 'ACTIVE', cls: 'bg-[#00D4FF15] text-[#00D4FF] border-[#00D4FF30]' },
  pending: { label: 'PENDING', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  failed: { label: 'FAILED', cls: 'bg-red-500/10 text-red-400 border-red-500/30' },
  skipped: { label: 'SKIPPED', cls: 'bg-[#1E2D45] text-[#8892A4] border-[#1E2D45]' },
}

const TYPE_ICONS: Record<string, string> = {
  daily: '🎯', weekly: '📅', project: '🚀', sprint: '⚡', recovery: '🔄', interview: '🎙️',
}

export function MissionsClient({ initialMissions }: Props) {
  const [missions, setMissions] = useState<Mission[]>(initialMissions)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const awardXP = useAwardXP()

  const activeMission = missions.find(m => m.status === 'active' || m.status === 'pending')
  const history = missions.filter(m => m.id !== activeMission?.id)

  const completedCount = missions.filter(m => m.status === 'completed').length
  const totalXPEarned = missions
    .filter(m => m.status === 'completed')
    .reduce((s, m) => s + m.xp_reward, 0)

  async function generateMission() {
    setGenerating(true)
    setMessage(null)
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setMissions(prev => [data.data, ...prev])
      } else if (data.message) {
        setMessage(data.message)
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
      await awardXP(xpReward, 'task_complete', taskId, 'Task completed')
      if (data.data.missionCompleted) {
        await awardXP(50, 'mission_complete', missionId, 'Mission completed')
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Missions</h1>
          <p className="text-[#8892A4] text-sm mt-0.5 font-mono">
            The system decides. You execute. One mission at a time.
          </p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="text-lg font-bold font-mono text-[#39FF14]">{completedCount}</div>
            <div className="text-xs text-[#8892A4] font-mono">completed</div>
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-[#00D4FF]">+{totalXPEarned}</div>
            <div className="text-xs text-[#8892A4] font-mono">XP earned</div>
          </div>
        </div>
      </div>

      {/* Active mission */}
      {activeMission ? (
        <TodayMissionCard mission={activeMission} onCompleteTask={completeTask} />
      ) : (
        <div className="mission-card p-8 flex flex-col items-center gap-4">
          <Target className="w-10 h-10 text-[#1E2D45]" />
          <div className="text-center">
            <h3 className="text-white font-semibold mb-1">No Active Mission</h3>
            <p className="text-[#8892A4] text-sm">
              Generate your next mission. The engine picks the highest-ROI skill for your current level.
            </p>
          </div>
          {message && (
            <p className="text-xs font-mono text-amber-400">{message}</p>
          )}
          <button
            onClick={generateMission}
            disabled={generating}
            className="flex items-center gap-2 bg-[#00D4FF] hover:bg-[#00B8E0] text-[#0A0F1E] font-semibold rounded-lg px-5 py-2.5 text-sm transition-all disabled:opacity-60"
            style={{ boxShadow: '0 0 16px rgba(0,212,255,0.4)' }}
          >
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Generate Mission
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-3">
            Mission Log
          </div>
          <div className="space-y-2">
            {history.map(mission => {
              const status = STATUS_STYLES[mission.status] ?? STATUS_STYLES.pending
              const completion = calculateCompletionPercentage(mission.tasks)
              return (
                <div key={mission.id} className="mission-card p-4 flex items-center gap-4">
                  <span className="text-xl flex-shrink-0">
                    {TYPE_ICONS[mission.mission_type] ?? '🎯'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{mission.title}</div>
                    <div className="text-xs text-[#8892A4] font-mono flex items-center gap-2 mt-0.5">
                      <span>{timeAgo(mission.created_at)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatMinutes(mission.estimated_minutes)}
                      </span>
                      <span>·</span>
                      <span>{completion}% done</span>
                    </div>
                  </div>
                  <div className="text-sm font-mono text-[#00D4FF] flex-shrink-0">
                    +{mission.xp_reward}
                  </div>
                  <span className={cn('text-[10px] font-mono px-2 py-0.5 rounded border flex-shrink-0', status.cls)}>
                    {status.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
