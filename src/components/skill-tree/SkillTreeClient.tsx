'use client'
// src/components/skill-tree/SkillTreeClient.tsx
import { useState } from 'react'
import type { SkillDomain, SkillNode, UserSkillProgress } from '@/types'
import { SkillDomainPanel } from './SkillDomainPanel'
import { SkillNodeModal } from './SkillNodeModal'
import { cn, getStatusColor } from '@/lib/utils'

interface Props {
  domains: SkillDomain[]
  nodes: SkillNode[]
  progress: UserSkillProgress[]
}

const PHASE_LABELS: Record<number, string> = {
  1: 'Phase 1 · Foundation',
  2: 'Phase 2 · Python',
  3: 'Phase 3 · Analytics',
  4: 'Phase 4 · Portfolio',
  5: 'Phase 5 · Interview Ready',
}

export function SkillTreeClient({ domains, nodes, progress }: Props) {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null)
  const [activePhase, setActivePhase] = useState<number | 'all'>('all')

  const phases = [1, 2, 3, 4, 5]
  const filteredDomains = activePhase === 'all'
    ? domains
    : domains.filter(d => d.phase === activePhase)

  // Progress stats
  const totalNodes = nodes.length
  const completedNodes = progress.filter(p => p.status === 'completed' || p.status === 'mastered').length
  const inProgressNodes = progress.filter(p => p.status === 'in_progress').length
  const availableNodes = progress.filter(p => p.status === 'available').length

  function getNodeProgress(nodeId: string) {
    return progress.find(p => p.skill_node_id === nodeId)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Skill Tree</h1>
            <p className="text-[#8892A4] text-sm mt-0.5 font-mono">
              Your complete Data Analyst learning path — unlocked by completion
            </p>
          </div>
          {/* Global stats */}
          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-lg font-bold font-mono text-[#39FF14]">{completedNodes}</div>
              <div className="text-xs text-[#8892A4] font-mono">completed</div>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-[#00D4FF]">{inProgressNodes}</div>
              <div className="text-xs text-[#8892A4] font-mono">in progress</div>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-[#F59E0B]">{availableNodes}</div>
              <div className="text-xs text-[#8892A4] font-mono">available</div>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-[#374151]">{totalNodes - completedNodes - inProgressNodes}</div>
              <div className="text-xs text-[#8892A4] font-mono">remaining</div>
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-mono text-[#8892A4] mb-1.5">
            <span>Overall completion</span>
            <span className="text-[#39FF14]">{Math.round((completedNodes / totalNodes) * 100)}%</span>
          </div>
          <div className="h-2 bg-[#1E2D45] rounded-full overflow-hidden flex">
            {/* Completed */}
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${(completedNodes / totalNodes) * 100}%`,
                background: 'linear-gradient(90deg, #22BB00, #39FF14)',
                boxShadow: '0 0 6px rgba(57,255,20,0.5)',
              }}
            />
            {/* In progress */}
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${(inProgressNodes / totalNodes) * 100}%`,
                background: '#00D4FF',
                boxShadow: '0 0 4px rgba(0,212,255,0.5)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Phase filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActivePhase('all')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-mono transition-all',
            activePhase === 'all'
              ? 'bg-[#00D4FF15] text-[#00D4FF] border border-[#00D4FF44]'
              : 'text-[#8892A4] border border-[#1E2D45] hover:border-[#2A3F5A] hover:text-white'
          )}
        >
          All Phases
        </button>
        {phases.map(phase => {
          const phaseDomains = domains.filter(d => d.phase === phase)
          const phaseNodes = nodes.filter(n => phaseDomains.some(d => d.id === n.domain_id))
          const phaseCompleted = progress.filter(p =>
            phaseNodes.some(n => n.id === p.skill_node_id) &&
            (p.status === 'completed' || p.status === 'mastered')
          ).length

          return (
            <button
              key={phase}
              onClick={() => setActivePhase(phase)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2',
                activePhase === phase
                  ? 'bg-[#00D4FF15] text-[#00D4FF] border border-[#00D4FF44]'
                  : 'text-[#8892A4] border border-[#1E2D45] hover:border-[#2A3F5A] hover:text-white'
              )}
            >
              {PHASE_LABELS[phase]}
              <span className="text-[#39FF14]">{phaseCompleted}/{phaseNodes.length}</span>
            </button>
          )
        })}
      </div>

      {/* Domains grid */}
      <div className="space-y-6">
        {(activePhase === 'all' ? phases : [activePhase as number]).map(phase => {
          const phaseDomains = filteredDomains.filter(d => d.phase === phase)
          if (phaseDomains.length === 0) return null

          return (
            <div key={phase}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono text-[#8892A4] uppercase tracking-wider">
                  {PHASE_LABELS[phase]}
                </span>
                <div className="flex-1 h-px bg-[#1E2D45]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {phaseDomains.map(domain => (
                  <SkillDomainPanel
                    key={domain.id}
                    domain={domain}
                    nodes={nodes.filter(n => n.domain_id === domain.id)}
                    progress={progress}
                    onSelectNode={setSelectedNode}
                    isSelected={selectedDomain === domain.id}
                    onSelect={() => setSelectedDomain(
                      selectedDomain === domain.id ? null : domain.id
                    )}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Node modal */}
      {selectedNode && (
        <SkillNodeModal
          node={selectedNode}
          progress={getNodeProgress(selectedNode.id)}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  )
}
