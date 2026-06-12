'use client'
// src/components/interviews/MockInterviewPanel.tsx
import { useState } from 'react'
import type { MockInterviewSession } from '@/types'
import { cn } from '@/lib/utils'
import { Mic2, Play, CheckCircle2, Clock } from 'lucide-react'

interface Props { sessions: MockInterviewSession[] }

const SESSION_TYPES = [
  { id: 'sql', label: 'SQL Technical', description: 'JOINs, CTEs, window functions, optimization', duration: '45 min', difficulty: 'Hard' },
  { id: 'python', label: 'Python/Pandas', description: 'DataFrames, cleaning, groupby, merge', duration: '40 min', difficulty: 'Medium' },
  { id: 'business_case', label: 'Business Case', description: 'Metrics decline, A/B test analysis, KPIs', duration: '30 min', difficulty: 'Hard' },
  { id: 'behavioral', label: 'Behavioral', description: 'STAR method, situational, culture fit', duration: '30 min', difficulty: 'Medium' },
  { id: 'full', label: 'Full Interview', description: 'Complete mock: SQL + business + behavioral', duration: '75 min', difficulty: 'Hard' },
]

export function MockInterviewPanel({ sessions }: Props) {
  const [starting, setStarting] = useState<string | null>(null)
  const [activeSession, setActiveSession] = useState<{ type: string; sessionId?: string } | null>(null)

  const completedSessions = sessions.filter(s => s.status === 'completed')
  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((s, sess) => s + (sess.overall_score ?? 0), 0) / completedSessions.length)
    : null

  async function startSession(type: string) {
    setStarting(type)
    // In real impl would create session in DB
    await new Promise(r => setTimeout(r, 500))
    setActiveSession({ type })
    setStarting(null)
  }

  if (activeSession) {
    return <MockSessionView sessionType={activeSession.type} onEnd={() => setActiveSession(null)} />
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {completedSessions.length > 0 && (
        <div className="mission-card p-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-xl font-bold font-mono text-[#00D4FF]">{completedSessions.length}</div>
              <div className="text-xs text-[#8892A4] font-mono">sessions completed</div>
            </div>
            {avgScore !== null && (
              <div>
                <div className="text-xl font-bold font-mono text-[#39FF14]">{avgScore}%</div>
                <div className="text-xs text-[#8892A4] font-mono">avg score</div>
              </div>
            )}
            <div>
              <div className="text-xl font-bold font-mono text-[#8B5CF6]">
                {completedSessions.filter(s => (s.overall_score ?? 0) >= 65).length}
              </div>
              <div className="text-xs text-[#8892A4] font-mono">passed</div>
            </div>
          </div>
        </div>
      )}

      {/* Session types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SESSION_TYPES.map(type => {
          const sessionsOfType = sessions.filter(s => s.session_type === type.id && s.status === 'completed')
          const lastSession = sessionsOfType[0]
          const isLoading = starting === type.id
          const diffColor = type.difficulty === 'Hard' ? '#EF4444' : '#F59E0B'

          return (
            <div key={type.id} className="mission-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg bg-[#8B5CF615] border border-[#8B5CF630] flex items-center justify-center"
                >
                  <Mic2 className="w-4 h-4 text-[#8B5CF6]" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono" style={{ color: diffColor }}>{type.difficulty}</div>
                  <div className="text-xs font-mono text-[#374151] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {type.duration}
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-white mb-1">{type.label}</h3>
              <p className="text-xs text-[#8892A4] mb-3 leading-relaxed">{type.description}</p>

              {lastSession && (
                <div className={cn(
                  'text-xs font-mono px-2 py-1 rounded mb-3 flex items-center gap-1.5',
                  (lastSession.overall_score ?? 0) >= 65
                    ? 'bg-[#39FF1415] text-[#39FF14]'
                    : 'bg-amber-500/10 text-amber-400'
                )}>
                  <CheckCircle2 className="w-3 h-3" />
                  Last: {lastSession.overall_score ?? 0}%
                </div>
              )}

              <button
                onClick={() => startSession(type.id)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#8B5CF615] hover:bg-[#8B5CF625] text-[#8B5CF6] border border-[#8B5CF640] hover:border-[#8B5CF660] rounded-lg py-2 text-xs font-semibold transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                {isLoading ? 'Starting...' : sessionsOfType.length > 0 ? 'Retake' : 'Start Session'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div>
          <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-3">Recent Sessions</div>
          <div className="space-y-2">
            {sessions.slice(0, 5).map(session => (
              <div key={session.id} className="mission-card p-3 flex items-center gap-4">
                <div>
                  <div className="text-sm font-medium text-white capitalize">
                    {session.session_type.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-[#8892A4] font-mono">
                    {new Date(session.created_at).toLocaleDateString()}
                    {session.duration_minutes && ` · ${session.duration_minutes}m`}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  {session.overall_score !== null && (
                    <div className={cn(
                      'text-sm font-bold font-mono',
                      session.overall_score >= 65 ? 'text-[#39FF14]' : 'text-amber-400'
                    )}>
                      {session.overall_score}%
                    </div>
                  )}
                  <span className={cn(
                    'text-xs font-mono px-2 py-0.5 rounded',
                    session.status === 'completed'
                      ? 'bg-[#39FF1415] text-[#39FF14] border border-[#39FF1430]'
                      : 'bg-[#1E2D45] text-[#8892A4]'
                  )}>
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Active Mock Session ----
function MockSessionView({ sessionType, onEnd }: { sessionType: string; onEnd: () => void }) {
  return (
    <div className="mission-card p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-[#8B5CF615] border border-[#8B5CF640] flex items-center justify-center mx-auto mb-4">
        <Mic2 className="w-8 h-8 text-[#8B5CF6]" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">
        {sessionType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} Mock Interview
      </h2>
      <p className="text-[#8892A4] text-sm mb-6">
        Your AI interviewer is ready. Answer questions honestly — this is how you find gaps.
      </p>
      <div className="bg-[#0A0F1E] border border-[#1E2D45] rounded-lg p-4 mb-6 text-left">
        <p className="text-sm text-[#8892A4] font-mono">
          💡 Tip: Speak your answers aloud, then type them. This builds the real interview skill of thinking and communicating simultaneously.
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onEnd}
          className="px-6 py-2.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-sm transition-all"
          style={{ boxShadow: '0 0 16px rgba(139,92,246,0.4)' }}
        >
          Begin Interview →
        </button>
        <button onClick={onEnd} className="px-6 py-2.5 rounded-lg border border-[#1E2D45] text-[#8892A4] text-sm hover:text-white transition-all">
          Cancel
        </button>
      </div>
    </div>
  )
}
