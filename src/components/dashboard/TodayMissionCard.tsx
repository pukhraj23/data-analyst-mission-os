'use client'
// src/components/dashboard/TodayMissionCard.tsx
import { useState } from 'react'
import type { Mission } from '@/types'
import { cn, calculateCompletionPercentage, formatMinutes } from '@/lib/utils'
import { CheckCircle2, Circle, Clock, Zap, ChevronDown, ChevronUp, Target, Lightbulb } from 'lucide-react'

interface TodayMissionCardProps {
  mission: Mission
  onCompleteTask: (missionId: string, taskId: string, xpReward: number) => Promise<void>
}

const TASK_TYPE_COLORS: Record<string, string> = {
  learn: '#3B82F6',
  practice: '#F59E0B',
  exercise: '#00D4FF',
  project: '#8B5CF6',
  interview: '#EF4444',
  review: '#10B981',
}

const TASK_TYPE_LABELS: Record<string, string> = {
  learn: 'LEARN',
  practice: 'PRACTICE',
  exercise: 'EXERCISE',
  project: 'PROJECT',
  interview: 'INTERVIEW',
  review: 'REVIEW',
}

export function TodayMissionCard({ mission, onCompleteTask }: TodayMissionCardProps) {
  const [completing, setCompleting] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const completion = calculateCompletionPercentage(mission.tasks)
  const isComplete = mission.status === 'completed'
  const completedTasks = mission.tasks.filter(t => t.status === 'completed').length

  async function handleCompleteTask(taskId: string, xpReward: number) {
    setCompleting(taskId)
    try {
      await onCompleteTask(mission.id, taskId, xpReward)
    } finally {
      setCompleting(null)
    }
  }

  return (
    <div className={cn(
      'mission-card p-5 h-full',
      isComplete && 'border-[#39FF1433]'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'text-xs font-mono px-2 py-0.5 rounded',
              isComplete
                ? 'bg-[#39FF1415] text-[#39FF14] border border-[#39FF1430]'
                : 'bg-[#00D4FF15] text-[#00D4FF] border border-[#00D4FF30]'
            )}>
              {isComplete ? '✓ COMPLETE' : '⚡ ACTIVE'}
            </span>
            <span className={cn(
              'text-xs font-mono px-2 py-0.5 rounded',
              mission.roi_score >= 75
                ? 'bg-[#39FF1415] text-[#39FF14] border border-[#39FF1430]'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            )}>
              ROI {mission.roi_score}
            </span>
          </div>
          <h2 className="text-white font-semibold text-base leading-tight truncate pr-2">
            {mission.title}
          </h2>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <div className="text-lg font-bold font-mono text-[#00D4FF]">+{mission.xp_reward}</div>
          <div className="text-xs text-[#8892A4] font-mono">XP</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-mono text-[#8892A4] mb-1.5">
          <span>{completedTasks}/{mission.tasks.length} tasks</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatMinutes(mission.estimated_minutes)}
          </span>
        </div>
        <div className="h-2 bg-[#1E2D45] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${completion}%`,
              background: isComplete
                ? 'linear-gradient(90deg, #22BB00, #39FF14)'
                : 'linear-gradient(90deg, #0099BB, #00D4FF)',
              boxShadow: isComplete
                ? '0 0 8px rgba(57,255,20,0.5)'
                : '0 0 8px rgba(0,212,255,0.5)',
            }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-2 mb-4">
        {mission.tasks.map((task) => {
          const taskColor = TASK_TYPE_COLORS[task.task_type] ?? '#6B7280'
          const isTaskComplete = task.status === 'completed'
          const isTaskLoading = completing === task.id

          return (
            <div
              key={task.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border transition-all',
                isTaskComplete
                  ? 'bg-[#39FF1408] border-[#39FF1420] opacity-70'
                  : 'bg-[#0A0F1E] border-[#1E2D45] hover:border-[#2A3F5A]'
              )}
            >
              {/* Complete button */}
              <button
                onClick={() => !isTaskComplete && handleCompleteTask(task.id, task.xp_reward)}
                disabled={isTaskComplete || isTaskLoading}
                className="mt-0.5 flex-shrink-0 transition-all hover:scale-110 disabled:cursor-default"
              >
                {isTaskComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-[#39FF14]" />
                ) : isTaskLoading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 text-[#374151] hover:text-[#00D4FF]" />
                )}
              </button>

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{
                      color: taskColor,
                      backgroundColor: `${taskColor}15`,
                      border: `1px solid ${taskColor}30`,
                    }}
                  >
                    {TASK_TYPE_LABELS[task.task_type] ?? task.task_type.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-[#8892A4] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {task.estimated_minutes}m
                  </span>
                </div>
                <p className={cn(
                  'text-sm leading-snug',
                  isTaskComplete ? 'line-through text-[#374151]' : 'text-white'
                )}>
                  {task.title}
                </p>
                {task.description && !isTaskComplete && (
                  <p className="text-xs text-[#8892A4] mt-0.5 leading-relaxed">{task.description}</p>
                )}
              </div>

              {/* XP */}
              <div className="text-xs font-mono text-[#00D4FF] flex-shrink-0">
                +{task.xp_reward}
              </div>
            </div>
          )
        })}
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1.5 text-xs text-[#8892A4] hover:text-white transition-colors font-mono"
      >
        {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {showDetails ? 'Hide' : 'Show'} mission details
      </button>

      {showDetails && (
        <div className="mt-3 space-y-3 animate-fade-in">
          {mission.career_impact && (
            <div className="bg-[#0A0F1E] border border-[#1E2D45] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span className="text-xs font-mono text-[#00D4FF] uppercase tracking-wider">Career Impact</span>
              </div>
              <p className="text-xs text-[#8892A4] leading-relaxed">{mission.career_impact}</p>
            </div>
          )}
          {mission.ai_leverage_tip && (
            <div className="bg-[#0A0F1E] border border-[#1E2D45] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">AI Leverage</span>
              </div>
              <p className="text-xs text-[#8892A4] leading-relaxed">{mission.ai_leverage_tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
