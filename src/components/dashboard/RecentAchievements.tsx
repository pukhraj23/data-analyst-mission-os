'use client'
// src/components/dashboard/RecentAchievements.tsx
import type { UserAchievement } from '@/types'
import { timeAgo } from '@/lib/utils'
import Link from 'next/link'
import { Trophy, ArrowRight } from 'lucide-react'

interface Props { achievements: UserAchievement[] }

export function RecentAchievements({ achievements }: Props) {
  return (
    <div className="mission-card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider">Achievements</div>
      </div>

      {achievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <Trophy className="w-8 h-8 text-[#1E2D45] mb-2" />
          <p className="text-xs text-[#374151] font-mono">Complete missions to earn badges</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {achievements.slice(0, 4).map(ua => {
            const achievement = (ua as UserAchievement & { achievements?: { name: string; icon: string | null; badge_color: string; description: string } }).achievements
            if (!achievement) return null
            return (
              <div key={ua.id} className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{
                    backgroundColor: `${achievement.badge_color}15`,
                    border: `1px solid ${achievement.badge_color}40`,
                  }}
                >
                  {achievement.icon ?? '🏆'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{achievement.name}</div>
                  <div className="text-[10px] text-[#374151] font-mono">{timeAgo(ua.earned_at)}</div>
                </div>
                <div className="text-xs font-mono text-[#F59E0B] flex-shrink-0">
                  +{ua.xp_awarded}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
