'use client'
// src/components/skill-tree/SkillDomainPanel.tsx
import type { SkillDomain, SkillNode, UserSkillProgress } from '@/types'
import { cn, getStatusColor, getDifficultyLabel, formatMinutes } from '@/lib/utils'
import { Lock, CheckCircle2, Play, Zap, TrendingUp } from 'lucide-react'

interface Props {
  domain: SkillDomain
  nodes: SkillNode[]
  progress: UserSkillProgress[]
  onSelectNode: (node: SkillNode) => void
  isSelected: boolean
  onSelect: () => void
}

const STATUS_ICONS = {
  locked: Lock,
  available: Zap,
  in_progress: Play,
  completed: CheckCircle2,
  mastered: CheckCircle2,
}

export function SkillDomainPanel({ domain, nodes, progress, onSelectNode, isSelected, onSelect }: Props) {
  const nodeProgresses = nodes.map(n => ({
    node: n,
    prog: progress.find(p => p.skill_node_id === n.id),
  }))

  const completed = nodeProgresses.filter(np =>
    np.prog?.status === 'completed' || np.prog?.status === 'mastered'
  ).length
  const inProgress = nodeProgresses.filter(np => np.prog?.status === 'in_progress').length
  const available = nodeProgresses.filter(np => np.prog?.status === 'available').length
  const completionPct = nodes.length > 0 ? Math.round((completed / nodes.length) * 100) : 0
  const domainColor = domain.color ?? '#3B82F6'

  return (
    <div
      className={cn(
        'mission-card p-4 cursor-pointer transition-all duration-200',
        isSelected && 'border-opacity-50'
      )}
      style={{
        borderColor: isSelected ? `${domainColor}60` : undefined,
        boxShadow: isSelected ? `0 0 20px ${domainColor}20` : undefined,
      }}
      onClick={onSelect}
    >
      {/* Domain header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: `${domainColor}15`, border: `1px solid ${domainColor}40` }}
          >
            {domain.icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{domain.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <TrendingUp className="w-3 h-3" style={{ color: domainColor }} />
              <span className="text-[10px] font-mono" style={{ color: domainColor }}>
                {domain.market_demand_score} demand
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold font-mono" style={{ color: domainColor }}>
            {completionPct}%
          </div>
          <div className="text-[10px] text-[#374151] font-mono">{completed}/{nodes.length}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#1E2D45] rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${completionPct}%`,
            backgroundColor: domainColor,
            boxShadow: `0 0 4px ${domainColor}80`,
          }}
        />
      </div>

      {/* Node list */}
      <div className="space-y-1.5">
        {nodeProgresses.map(({ node, prog }) => {
          const status = prog?.status ?? 'locked'
          const statusColor = getStatusColor(status)
          const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] ?? Lock
          const isLocked = status === 'locked'

          return (
            <button
              key={node.id}
              onClick={e => {
                e.stopPropagation()
                if (!isLocked) onSelectNode(node)
              }}
              disabled={isLocked}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all',
                isLocked
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-[#ffffff08] cursor-pointer'
              )}
            >
              <Icon
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: isLocked ? '#374151' : statusColor }}
              />
              <span className={cn(
                'text-xs flex-1 truncate',
                isLocked ? 'text-[#374151]' : 'text-[#8892A4]',
                (status === 'completed' || status === 'mastered') && 'line-through text-[#374151]'
              )}>
                {node.name}
              </span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!isLocked && prog?.mastery_score !== undefined && prog.mastery_score > 0 && (
                  <span className="text-[10px] font-mono" style={{ color: statusColor }}>
                    {prog.mastery_score}%
                  </span>
                )}
                <span className="text-[10px] font-mono text-[#374151]">
                  +{node.xp_reward}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Status chips */}
      {(inProgress > 0 || available > 0) && (
        <div className="flex gap-1.5 mt-3 pt-3 border-t border-[#1E2D45]">
          {inProgress > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00D4FF15] text-[#00D4FF] border border-[#00D4FF30]">
              {inProgress} active
            </span>
          )}
          {available > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {available} ready
            </span>
          )}
        </div>
      )}
    </div>
  )
}
