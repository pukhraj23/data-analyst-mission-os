'use client'
// src/components/dashboard/MarketIntelCard.tsx
import type { MarketIntelligence } from '@/types'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props { data: MarketIntelligence[] }

const TREND_ICONS = {
  rising: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
}
const TREND_COLORS = {
  rising: '#39FF14',
  stable: '#F59E0B',
  declining: '#EF4444',
}

export function MarketIntelCard({ data }: Props) {
  return (
    <div className="mission-card p-5 h-full">
      <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-4">Market Demand</div>
      <div className="space-y-2.5">
        {data.slice(0, 6).map(item => {
          const TrendIcon = TREND_ICONS[item.trend]
          const trendColor = TREND_COLORS[item.trend]
          return (
            <div key={item.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white font-medium truncate">{item.skill_name}</span>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
                    <span className="text-xs font-mono" style={{ color: trendColor }}>
                      {item.demand_score}
                    </span>
                  </div>
                </div>
                <div className="h-1 bg-[#1E2D45] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.demand_score}%`,
                      backgroundColor: trendColor,
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-[#374151] font-mono mt-3">Based on job posting analysis</p>
    </div>
  )
}
