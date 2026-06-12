'use client'
// src/components/dashboard/ReadinessBreakdownCard.tsx
import type { ReadinessBreakdown } from '@/types'
import { getReadinessColor } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Props { breakdown: ReadinessBreakdown }

const DOMAIN_LABELS: Record<string, string> = {
  sql: 'SQL',
  python: 'Python/Pandas',
  statistics: 'Statistics',
  businessAnalytics: 'Business Analytics',
  projects: 'Projects',
  resume: 'Resume/LinkedIn',
  interviews: 'Interview Prep',
}

export function ReadinessBreakdownCard({ breakdown }: Props) {
  const scores: Array<{ key: string; value: number }> = [
    { key: 'sql', value: breakdown.sql },
    { key: 'python', value: breakdown.python },
    { key: 'businessAnalytics', value: breakdown.businessAnalytics },
    { key: 'projects', value: breakdown.projects },
    { key: 'interviews', value: breakdown.interviews },
    { key: 'resume', value: breakdown.resume },
  ]

  return (
    <div className="mission-card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider">Skill Breakdown</div>
        <Link href="/analytics" className="text-xs text-[#00D4FF] hover:text-[#00B8E0] font-mono flex items-center gap-1">
          Details <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {scores.map(({ key, value }) => {
          const color = getReadinessColor(value)
          return (
            <div key={key}>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#8892A4]">{DOMAIN_LABELS[key]}</span>
                <span style={{ color }}>{value}%</span>
              </div>
              <div className="h-1.5 bg-[#1E2D45] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${value}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 4px ${color}88`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Probability */}
      <div className="mt-4 pt-4 border-t border-[#1E2D45]">
        <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-2">Offer Probability</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#0A0F1E] rounded-lg p-2.5 text-center">
            <div className="text-xl font-bold font-mono text-[#00D4FF]">
              {breakdown.probability.internship}%
            </div>
            <div className="text-[10px] text-[#8892A4] font-mono">Internship</div>
          </div>
          <div className="bg-[#0A0F1E] rounded-lg p-2.5 text-center">
            <div className="text-xl font-bold font-mono text-[#39FF14]">
              {breakdown.probability.interview}%
            </div>
            <div className="text-[10px] text-[#8892A4] font-mono">Interview Pass</div>
          </div>
        </div>
      </div>
    </div>
  )
}
