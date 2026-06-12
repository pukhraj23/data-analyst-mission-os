'use client'
// src/components/dashboard/XPLevelBar.tsx
import type { Profile, Level } from '@/types'
import { getLevelProgress, getXPToNextLevel, LEVELS } from '@/lib/engines/xp-engine'
import { formatXP } from '@/lib/utils'
import { Trophy } from 'lucide-react'

interface XPLevelBarProps {
  profile: Profile | null
  level: Level | null
}

export function XPLevelBar({ profile, level }: XPLevelBarProps) {
  if (!profile || !level) {
    return (
      <div className="mission-card p-5 h-full">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[#1E2D45] rounded w-1/2" />
          <div className="h-3 bg-[#1E2D45] rounded" />
          <div className="h-6 bg-[#1E2D45] rounded" />
        </div>
      </div>
    )
  }

  const progress = getLevelProgress(profile.total_xp)
  const xpToNext = getXPToNextLevel(profile.total_xp)
  const nextLevel = LEVELS.find(l => l.id === level.id + 1)
  const isMaxLevel = level.id === LEVELS.length

  return (
    <div className="mission-card p-5 h-full">
      <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-4">Level Progress</div>

      {/* Level badge + info */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-mono flex-shrink-0"
          style={{
            backgroundColor: `${level.badge_color}15`,
            border: `2px solid ${level.badge_color}60`,
            color: level.badge_color,
            boxShadow: `0 0 16px ${level.badge_color}30`,
          }}
        >
          {level.id}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold">{level.title}</div>
          <div className="text-xs text-[#8892A4] font-mono">{level.description}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold font-mono" style={{ color: level.badge_color }}>
            {formatXP(profile.total_xp)}
          </div>
          <div className="text-xs text-[#8892A4] font-mono">total XP</div>
        </div>
      </div>

      {/* XP bar */}
      {!isMaxLevel && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-[#8892A4]">
            <span>Level {level.id}</span>
            <span style={{ color: level.badge_color }}>{progress}% to {nextLevel?.title}</span>
          </div>
          <div className="h-3 bg-[#1E2D45] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${level.badge_color}88, ${level.badge_color})`,
                boxShadow: `0 0 8px ${level.badge_color}80`,
              }}
            />
          </div>
          <div className="text-xs font-mono text-[#8892A4] text-right">
            {formatXP(xpToNext)} XP to Level {level.id + 1}
          </div>
        </div>
      )}

      {isMaxLevel && (
        <div className="flex items-center gap-2 text-sm text-[#39FF14] font-mono">
          <Trophy className="w-4 h-4" />
          Maximum level reached — Job Ready!
        </div>
      )}

      {/* Level path */}
      <div className="mt-4 flex items-center gap-1">
        {LEVELS.map((l, i) => (
          <div key={l.id} className="flex items-center flex-1">
            <div
              className="h-1.5 flex-1 rounded-full transition-all"
              style={{
                backgroundColor: profile.current_level >= l.id ? l.badge_color : '#1E2D45',
                boxShadow: profile.current_level >= l.id ? `0 0 4px ${l.badge_color}80` : 'none',
              }}
            />
            {i < LEVELS.length - 1 && (
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 transition-all"
                style={{
                  backgroundColor: profile.current_level > l.id ? l.badge_color : profile.current_level === l.id ? l.badge_color : '#1E2D45',
                  boxShadow: profile.current_level >= l.id ? `0 0 4px ${l.badge_color}` : 'none',
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] font-mono text-[#374151]">Beginner</span>
        <span className="text-[9px] font-mono text-[#39FF14]">Job Ready</span>
      </div>
    </div>
  )
}
