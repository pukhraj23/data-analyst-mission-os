'use client'
// src/components/dashboard/StreakCard.tsx
import type { DailyActivity } from '@/types'
import { Flame, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakCardProps {
  currentStreak: number
  longestStreak: number
  activity: DailyActivity[]
}

export function StreakCard({ currentStreak, longestStreak, activity }: StreakCardProps) {
  // Build last 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const dateStr = d.toISOString().split('T')[0]
    const act = activity.find(a => a.date === dateStr)
    return { date: dateStr, xp: act?.xp_earned ?? 0, active: (act?.xp_earned ?? 0) > 0 }
  })

  const streakColor = currentStreak >= 14 ? '#39FF14' : currentStreak >= 7 ? '#00D4FF' : '#F59E0B'

  return (
    <div className="mission-card p-5 h-full">
      <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-4">Study Streak</div>

      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: `${streakColor}15`,
            border: `1px solid ${streakColor}40`,
          }}
        >
          <Flame className="w-6 h-6" style={{ color: streakColor }} />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono" style={{ color: streakColor }}>
            {currentStreak}
          </div>
          <div className="text-xs text-[#8892A4] font-mono">day streak</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-sm font-mono text-[#8892A4]">{longestStreak}</div>
          <div className="text-xs text-[#374151] font-mono">best</div>
        </div>
      </div>

      {/* 14-day grid */}
      <div className="flex gap-1.5 items-end">
        {days.map(day => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={cn('w-full rounded-sm transition-all', day.active ? 'opacity-100' : 'opacity-30')}
              style={{
                height: day.active ? `${Math.max(12, Math.min(32, 12 + (day.xp / 20)))}px` : '8px',
                backgroundColor: day.active ? streakColor : '#1E2D45',
                boxShadow: day.active ? `0 0 4px ${streakColor}60` : 'none',
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] font-mono text-[#374151]">14d ago</span>
        <span className="text-[9px] font-mono text-[#374151]">today</span>
      </div>

      {currentStreak === 0 && (
        <p className="text-xs text-amber-400 font-mono mt-3">
          ⚡ Complete today's mission to start a streak
        </p>
      )}
      {currentStreak >= 7 && (
        <p className="text-xs font-mono mt-3" style={{ color: streakColor }}>
          {currentStreak >= 30 ? '🏆 Legendary streak!' : currentStreak >= 14 ? '💎 Champion streak!' : '🔥 On fire! Keep going.'}
        </p>
      )}
    </div>
  )
}
