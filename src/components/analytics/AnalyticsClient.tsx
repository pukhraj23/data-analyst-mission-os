'use client'
// src/components/analytics/AnalyticsClient.tsx
import type { DailyActivity, ReadinessSnapshot, XPTransaction, UserAchievement } from '@/types'
import { formatDate, formatMinutes, timeAgo } from '@/lib/utils'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, Zap, Clock, Target, Trophy } from 'lucide-react'

interface Props {
  activity: DailyActivity[]
  snapshots: ReadinessSnapshot[]
  xpTransactions: XPTransaction[]
  achievements: UserAchievement[]
}

const CHART_THEME = {
  background: 'transparent',
  text: '#8892A4',
  grid: '#1E2D45',
  tooltip: {
    contentStyle: {
      backgroundColor: '#111827',
      border: '1px solid #1E2D45',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '12px',
      fontFamily: 'JetBrains Mono',
    },
    labelStyle: { color: '#8892A4' },
  },
}

export function AnalyticsClient({ activity, snapshots, xpTransactions, achievements }: Props) {
  const totalXP = xpTransactions.reduce((s, t) => s + t.amount, 0)
  const totalHours = Math.round(activity.reduce((s, d) => s + d.time_spent_minutes, 0) / 60 * 10) / 10
  const totalTasks = activity.reduce((s, d) => s + d.tasks_completed, 0)
  const totalMissions = activity.reduce((s, d) => s + d.missions_completed, 0)
  const activeDays = activity.filter(d => d.xp_earned > 0).length
  const consistencyScore = activity.length > 0 ? Math.round((activeDays / 30) * 100) : 0

  // Velocity: XP per active day last 7 vs previous 7
  const last7 = activity.slice(-7)
  const prev7 = activity.slice(-14, -7)
  const velocityNow = last7.reduce((s, d) => s + d.xp_earned, 0) / Math.max(last7.length, 1)
  const velocityPrev = prev7.reduce((s, d) => s + d.xp_earned, 0) / Math.max(prev7.length, 1)
  const velocityTrend = velocityPrev > 0
    ? Math.round(((velocityNow - velocityPrev) / velocityPrev) * 100)
    : 0

  // Readiness gain
  const readinessGain = snapshots.length >= 2
    ? snapshots[snapshots.length - 1].internship_readiness - snapshots[0].internship_readiness
    : 0

  // XP by type breakdown
  const xpByType: Record<string, number> = {}
  xpTransactions.forEach(t => {
    xpByType[t.transaction_type] = (xpByType[t.transaction_type] ?? 0) + t.amount
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-[#8892A4] text-sm mt-0.5 font-mono">30-day learning performance</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total XP Earned', value: `+${totalXP.toLocaleString()}`, color: '#00D4FF', icon: Zap },
          { label: 'Study Hours', value: `${totalHours}h`, color: '#39FF14', icon: Clock },
          { label: 'Consistency', value: `${consistencyScore}%`, color: '#F59E0B', icon: Target },
          { label: 'Readiness Gain', value: `+${readinessGain}%`, color: '#8B5CF6', icon: TrendingUp },
        ].map(kpi => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="mission-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: kpi.color }} />
                <span className="text-xs font-mono text-[#8892A4]">{kpi.label}</span>
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: kpi.color }}>{kpi.value}</div>
              {kpi.label === 'Total XP Earned' && (
                <div className={`text-xs font-mono mt-1 ${velocityTrend >= 0 ? 'text-[#39FF14]' : 'text-red-400'}`}>
                  {velocityTrend >= 0 ? '↑' : '↓'} {Math.abs(velocityTrend)}% vs last week
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Readiness trend chart */}
      {snapshots.length > 1 && (
        <div className="mission-card p-5">
          <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-4">
            Readiness Score Trend
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={snapshots.map(s => ({
              date: formatDate(s.snapshot_date),
              internship: s.internship_readiness,
              interview: s.interview_readiness,
              job: s.job_readiness,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis dataKey="date" tick={{ fill: CHART_THEME.text, fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <YAxis domain={[0, 100]} tick={{ fill: CHART_THEME.text, fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <Tooltip {...CHART_THEME.tooltip} />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: CHART_THEME.text }} />
              <Line type="monotone" dataKey="internship" stroke="#00D4FF" strokeWidth={2} dot={false} name="Internship" />
              <Line type="monotone" dataKey="interview" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Interview" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* XP and study time charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily XP */}
        <div className="mission-card p-5">
          <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-4">Daily XP Earned</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={activity.slice(-14).map(d => ({
              date: formatDate(d.date),
              xp: d.xp_earned,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: CHART_THEME.text, fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <YAxis tick={{ fill: CHART_THEME.text, fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <Tooltip {...CHART_THEME.tooltip} />
              <Bar dataKey="xp" name="XP" fill="#00D4FF" radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Study time */}
        <div className="mission-card p-5">
          <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-4">Study Time (minutes)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={activity.slice(-14).map(d => ({
              date: formatDate(d.date),
              minutes: d.time_spent_minutes,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: CHART_THEME.text, fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <YAxis tick={{ fill: CHART_THEME.text, fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <Tooltip {...CHART_THEME.tooltip} />
              <Bar dataKey="minutes" name="Minutes" fill="#39FF14" radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Achievements + Recent XP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Achievements */}
        <div className="mission-card p-5">
          <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5" />
            Achievements ({achievements.length})
          </div>
          {achievements.length === 0 ? (
            <p className="text-sm text-[#374151] font-mono">No achievements yet. Complete missions to earn badges.</p>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {achievements.map(ua => {
                const achievement = (ua as UserAchievement & { achievements?: { name: string; icon: string | null; badge_color: string; description: string } }).achievements
                if (!achievement) return null
                return (
                  <div key={ua.id} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ backgroundColor: `${achievement.badge_color}15`, border: `1px solid ${achievement.badge_color}40` }}
                    >
                      {achievement.icon ?? '🏆'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{achievement.name}</div>
                      <div className="text-xs text-[#8892A4]">{achievement.description}</div>
                    </div>
                    <div className="text-xs font-mono text-[#F59E0B] flex-shrink-0">
                      +{ua.xp_awarded} XP
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent XP Transactions */}
        <div className="mission-card p-5">
          <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            Recent XP Activity
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {xpTransactions.slice(0, 15).map(tx => (
              <div key={tx.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#00D4FF15] flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-[#00D4FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white truncate">{tx.description ?? tx.transaction_type}</div>
                  <div className="text-[10px] text-[#374151] font-mono">{timeAgo(tx.created_at)}</div>
                </div>
                <div className="text-sm font-bold font-mono text-[#39FF14] flex-shrink-0">
                  +{tx.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
