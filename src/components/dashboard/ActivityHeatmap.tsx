'use client'
// src/components/dashboard/ActivityHeatmap.tsx
import type { DailyActivity } from '@/types'
import { formatDate, formatMinutes } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props { activity: DailyActivity[] }

export function ActivityHeatmap({ activity }: Props) {
  // Build last 14 days enriched data
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const dateStr = d.toISOString().split('T')[0]
    const act = activity.find(a => a.date === dateStr)
    return {
      date: dateStr,
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      xp: act?.xp_earned ?? 0,
      minutes: act?.time_spent_minutes ?? 0,
      tasks: act?.tasks_completed ?? 0,
      missions: act?.missions_completed ?? 0,
      isToday: dateStr === new Date().toISOString().split('T')[0],
    }
  })

  const maxXP = Math.max(...days.map(d => d.xp), 1)

  const totals = {
    xp: days.reduce((s, d) => s + d.xp, 0),
    hours: Math.round(days.reduce((s, d) => s + d.minutes, 0) / 60 * 10) / 10,
    tasks: days.reduce((s, d) => s + d.tasks, 0),
    activeDays: days.filter(d => d.xp > 0).length,
  }

  return (
    <div className="mission-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider">14-Day Activity</div>
        <div className="flex items-center gap-3 text-xs font-mono text-[#8892A4]">
          <span>{totals.activeDays}/14 days</span>
          <span className="text-[#00D4FF]">+{totals.xp} XP</span>
          <span className="text-[#39FF14]">{totals.hours}h</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1.5 h-16">
        {days.map(day => {
          const heightPct = maxXP > 0 ? (day.xp / maxXP) : 0
          const hasActivity = day.xp > 0

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              {hasActivity && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1A2035] border border-[#1E2D45] rounded-md px-2.5 py-1.5 text-[10px] font-mono whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="text-white">{day.dateLabel}</div>
                  <div className="text-[#00D4FF]">+{day.xp} XP</div>
                  {day.minutes > 0 && <div className="text-[#39FF14]">{formatMinutes(day.minutes)}</div>}
                  {day.tasks > 0 && <div className="text-[#8892A4]">{day.tasks} tasks</div>}
                </div>
              )}
              <div
                className={cn(
                  'w-full rounded-t transition-all duration-300',
                  day.isToday ? 'opacity-100' : hasActivity ? 'opacity-80 hover:opacity-100' : 'opacity-30'
                )}
                style={{
                  height: hasActivity ? `${Math.max(8, heightPct * 52)}px` : '4px',
                  background: day.isToday
                    ? 'linear-gradient(180deg, #00D4FF, #0099BB)'
                    : hasActivity
                    ? 'linear-gradient(180deg, #39FF14, #22BB00)'
                    : '#1E2D45',
                  boxShadow: hasActivity
                    ? `0 0 6px ${day.isToday ? 'rgba(0,212,255,0.5)' : 'rgba(57,255,20,0.4)'}`
                    : 'none',
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Day labels */}
      <div className="flex gap-1.5 mt-1">
        {days.map(day => (
          <div key={day.date} className="flex-1 text-center">
            <span className={cn(
              'text-[9px] font-mono',
              day.isToday ? 'text-[#00D4FF]' : 'text-[#374151]'
            )}>
              {day.dayLabel[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-[#1E2D45]">
        {[
          { label: 'Active Days', value: totals.activeDays },
          { label: 'Total XP', value: `+${totals.xp}` },
          { label: 'Hours', value: `${totals.hours}h` },
          { label: 'Tasks', value: totals.tasks },
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <div className="text-sm font-bold font-mono text-white">{stat.value}</div>
            <div className="text-[10px] text-[#8892A4] font-mono">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
