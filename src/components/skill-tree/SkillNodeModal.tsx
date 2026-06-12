'use client'
// src/components/skill-tree/SkillNodeModal.tsx
import { useState } from 'react'
import type { SkillNode, UserSkillProgress } from '@/types'
import { cn, getDifficultyLabel, getDifficultyColor, formatMinutes, getStatusColor } from '@/lib/utils'
import { X, Star, Clock, Zap, TrendingUp, Target, Lightbulb, CheckCircle2, Lock } from 'lucide-react'
import { useAwardXP } from '@/lib/store'
import { useRouter } from 'next/navigation'

interface Props {
  node: SkillNode
  progress: UserSkillProgress | undefined
  onClose: () => void
}

export function SkillNodeModal({ node, progress, onClose }: Props) {
  const [starting, setStarting] = useState(false)
  const [completing, setCompleting] = useState(false)
  const awardXP = useAwardXP()
  const router = useRouter()
  const status = progress?.status ?? 'locked'

  async function startSkill() {
    setStarting(true)
    await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', skillNodeId: node.id }),
    })
    setStarting(false)
    onClose()
    router.push(`/learn/${node.id}`)
  }

  async function completeSkill() {
    setCompleting(true)
    const masteryScore = 80 // Default mastery score for manual completion
    const res = await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete', skillNodeId: node.id, masteryScore }),
    })
    if (res.ok) {
      await awardXP(node.xp_reward, 'skill_unlock', node.id, `Completed: ${node.name}`)
    }
    setCompleting(false)
    onClose()
  }

  const statusColor = getStatusColor(status)

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#111827] border border-[#1E2D45] rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[#1E2D45]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-mono px-2 py-0.5 rounded"
                style={{
                  color: statusColor,
                  backgroundColor: `${statusColor}15`,
                  border: `1px solid ${statusColor}30`,
                }}
              >
                {status.replace('_', ' ').toUpperCase()}
              </span>
              {node.is_sprint_essential && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#39FF1415] text-[#39FF14] border border-[#39FF1430]">
                  SPRINT ESSENTIAL
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white">{node.name}</h2>
            {node.description && (
              <p className="text-sm text-[#8892A4] mt-1">{node.description}</p>
            )}
          </div>
          <button onClick={onClose} className="text-[#374151] hover:text-white transition-colors ml-4 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 p-5 border-b border-[#1E2D45]">
          {[
            { icon: Star, label: 'Difficulty', value: getDifficultyLabel(node.difficulty), color: getDifficultyColor(node.difficulty) },
            { icon: Clock, label: 'Est. Time', value: formatMinutes(node.estimated_minutes), color: '#00D4FF' },
            { icon: Zap, label: 'XP Reward', value: `+${node.xp_reward}`, color: '#F59E0B' },
            { icon: TrendingUp, label: 'Market Demand', value: `${node.market_demand_score}%`, color: '#39FF14' },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="text-center">
                <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: stat.color }} />
                <div className="text-sm font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-[10px] text-[#374151] font-mono">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* ROI scores */}
        <div className="p-5 border-b border-[#1E2D45] space-y-3">
          <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider">Career ROI Scores</div>
          {[
            { label: 'Career Value', value: node.career_value_score, color: '#00D4FF' },
            { label: 'Interview Frequency', value: node.interview_frequency_score, color: '#EF4444' },
            { label: 'Market Demand', value: node.market_demand_score, color: '#39FF14' },
          ].map(score => (
            <div key={score.label}>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#8892A4]">{score.label}</span>
                <span style={{ color: score.color }}>{score.value}/100</span>
              </div>
              <div className="h-1.5 bg-[#1E2D45] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${score.value}%`,
                    backgroundColor: score.color,
                    boxShadow: `0 0 4px ${score.color}80`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Prerequisites */}
        {node.prerequisites.length > 0 && (
          <div className="p-5 border-b border-[#1E2D45]">
            <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-2">Prerequisites</div>
            <div className="flex flex-wrap gap-2">
              {node.prerequisites.map(prereq => (
                <span
                  key={prereq}
                  className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#0A0F1E] border border-[#1E2D45] text-[#8892A4]"
                >
                  {prereq.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Progress if exists */}
        {progress && progress.mastery_score > 0 && (
          <div className="p-5 border-b border-[#1E2D45]">
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-[#8892A4] uppercase tracking-wider">Mastery Score</span>
              <span style={{ color: statusColor }}>{progress.mastery_score}%</span>
            </div>
            <div className="h-2 bg-[#1E2D45] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress.mastery_score}%`,
                  backgroundColor: statusColor,
                }}
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="p-5">
          {status === 'available' && (
            <button
              onClick={startSkill}
              disabled={starting}
              className="w-full flex items-center justify-center gap-2 bg-[#00D4FF] hover:bg-[#00B8E0] text-[#0A0F1E] font-semibold rounded-lg px-4 py-2.5 text-sm transition-all disabled:opacity-60"
              style={{ boxShadow: '0 0 16px rgba(0,212,255,0.4)' }}
            >
              {starting ? 'Starting...' : 'Start Learning →'}
            </button>
          )}
          {status === 'in_progress' && (
            <div className="space-y-2">
            <button
              onClick={() => { onClose(); router.push(`/learn/${node.id}`) }}
              className="w-full flex items-center justify-center gap-2 bg-[#00D4FF15] hover:bg-[#00D4FF25] text-[#00D4FF] border border-[#00D4FF40] font-semibold rounded-lg px-4 py-2.5 text-sm transition-all"
            >
              Open Lesson →
            </button>
            <button
              onClick={completeSkill}
              disabled={completing}
              className="w-full flex items-center justify-center gap-2 bg-[#39FF14] hover:bg-[#2ECC11] text-[#0A0F1E] font-semibold rounded-lg px-4 py-2.5 text-sm transition-all disabled:opacity-60"
              style={{ boxShadow: '0 0 16px rgba(57,255,20,0.4)' }}
            >
              <CheckCircle2 className="w-4 h-4" />
              {completing ? 'Completing...' : `Mark Complete · +${node.xp_reward} XP`}
            </button>
            </div>
          )}
          {status === 'locked' && (
            <div className="flex items-center justify-center gap-2 text-sm text-[#374151] font-mono">
              <Lock className="w-4 h-4" />
              Complete prerequisites to unlock
            </div>
          )}
          {(status === 'completed' || status === 'mastered') && (
            <div className="flex items-center justify-center gap-2 text-sm text-[#39FF14] font-mono">
              <CheckCircle2 className="w-4 h-4" />
              {status === 'mastered' ? 'Mastered!' : 'Completed'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
