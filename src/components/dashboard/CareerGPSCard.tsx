'use client'
// src/components/dashboard/CareerGPSCard.tsx
import { Compass, ArrowRight, AlertTriangle, Clock } from 'lucide-react'
import Link from 'next/link'
import type { ReadinessBreakdown } from '@/types'
import { getPriorityLabel } from '@/lib/utils'

interface CareerGPSCardProps {
  topROIAction: string
  gaps: ReadinessBreakdown['gaps']
  weeksToReady: number
}

const PRIORITY_COLORS = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#10B981',
}

export function CareerGPSCard({ topROIAction, gaps, weeksToReady }: CareerGPSCardProps) {
  const criticalGaps = gaps.filter(g => g.priority === 'critical' || g.priority === 'high').slice(0, 3)

  return (
    <div
      className="mission-card p-5 border-[#00D4FF22]"
      style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.04) 0%, #111827 60%)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00D4FF15] border border-[#00D4FF33] flex items-center justify-center">
            <Compass className="w-4 h-4 text-[#00D4FF]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Career GPS</div>
            <div className="text-xs font-mono text-[#8892A4]">Highest ROI action right now</div>
          </div>
        </div>
        {weeksToReady > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-[#8892A4]" />
            <span className="text-[#8892A4]">~{weeksToReady}w remaining</span>
          </div>
        )}
      </div>

      {/* Top action */}
      <div className="bg-[#0A0F1E] border border-[#00D4FF22] rounded-lg p-4 mb-4">
        <div className="flex items-start gap-2">
          <ArrowRight className="w-4 h-4 text-[#00D4FF] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-white leading-relaxed">{topROIAction}</p>
        </div>
      </div>

      {/* Gaps */}
      {criticalGaps.length > 0 && (
        <div>
          <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            Skill Gaps to Close
          </div>
          <div className="grid grid-cols-3 gap-2">
            {criticalGaps.map(gap => (
              <div
                key={gap.skill}
                className="bg-[#0A0F1E] border border-[#1E2D45] rounded-lg p-3"
              >
                <div className="text-xs font-semibold text-white mb-1">{gap.skill}</div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex-1 h-1 bg-[#1E2D45] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${gap.currentScore}%`,
                        backgroundColor: PRIORITY_COLORS[gap.priority],
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono"
                    style={{ color: PRIORITY_COLORS[gap.priority] }}
                  >
                    {gap.currentScore}%
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#8892A4]">
                  Need {gap.requiredScore}% · ~{gap.estimatedHours}h
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Link
          href="/skill-tree"
          className="text-xs font-mono text-[#00D4FF] hover:text-[#00B8E0] transition-colors flex items-center gap-1"
        >
          View skill tree <ArrowRight className="w-3 h-3" />
        </Link>
        <span className="text-[#1E2D45]">·</span>
        <Link
          href="/career-gps"
          className="text-xs font-mono text-[#8892A4] hover:text-white transition-colors flex items-center gap-1"
        >
          Full career analysis <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}
