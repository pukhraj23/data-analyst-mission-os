// src/app/career-gps/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  calculateReadinessBreakdown,
  estimateWeeksToInternshipReady,
} from '@/lib/engines/readiness-engine'
import { getPriorityLabel, getReadinessColor } from '@/lib/utils'
import Link from 'next/link'
import { Compass, ArrowRight, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#10B981',
}

export default async function CareerGPSPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, progressRes, projectsRes, mockRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_skill_progress').select('*').eq('user_id', user.id),
    supabase.from('projects').select('*').eq('user_id', user.id),
    supabase.from('mock_interview_sessions').select('*').eq('user_id', user.id),
  ])

  const profile = profileRes.data
  const skillProgress = progressRes.data ?? []

  const breakdown = calculateReadinessBreakdown({
    skillProgress,
    projects: projectsRes.data ?? [],
    mockInterviews: mockRes.data ?? [],
    hasResume: skillProgress.some(
      (s: { skill_node_id: string; status: string }) =>
        s.skill_node_id === 'resume_build' && ['completed', 'mastered'].includes(s.status)
    ),
    hasLinkedIn: skillProgress.some(
      (s: { skill_node_id: string; status: string }) =>
        s.skill_node_id === 'linkedin_profile' && ['completed', 'mastered'].includes(s.status)
    ),
    assessmentScores: [],
  })

  const weeksToReady = estimateWeeksToInternshipReady(
    breakdown.overall,
    profile?.study_goal_minutes_per_day ?? 60
  )

  const readinessColor = getReadinessColor(breakdown.overall)

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Career GPS</h1>
        <p className="text-[#8892A4] text-sm mt-0.5 font-mono">
          Gap analysis against internship requirements. The system tells you exactly what to fix.
        </p>
      </div>

      {/* Top recommendation */}
      <div
        className="mission-card p-6 border-[#00D4FF22]"
        style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.05) 0%, #111827 60%)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-5 h-5 text-[#00D4FF]" />
          <span className="text-sm font-semibold text-white">Highest ROI Action Right Now</span>
        </div>
        <p className="text-base text-white leading-relaxed mb-4">{breakdown.topROIAction}</p>
        <div className="flex items-center gap-4 text-xs font-mono text-[#8892A4]">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {weeksToReady === 0 ? 'Internship ready now' : `~${weeksToReady} weeks to internship-ready`}
          </span>
          <span>·</span>
          <span style={{ color: readinessColor }}>{breakdown.overall}% readiness</span>
        </div>
      </div>

      {/* Probabilities */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Internship Offer', value: breakdown.probability.internship, color: '#00D4FF' },
          { label: 'Interview Pass', value: breakdown.probability.interview, color: '#8B5CF6' },
          { label: 'Job Offer', value: breakdown.probability.jobOffer, color: '#39FF14' },
        ].map(p => (
          <div key={p.label} className="mission-card p-5 text-center">
            <div className="text-3xl font-bold font-mono mb-1" style={{ color: p.color }}>
              {p.value}%
            </div>
            <div className="text-xs text-[#8892A4] font-mono">{p.label}</div>
          </div>
        ))}
      </div>

      {/* Gap analysis */}
      <div className="mission-card p-5">
        <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-4">
          Gap Analysis · Sorted by Priority
        </div>
        {breakdown.gaps.length === 0 ? (
          <p className="text-sm text-[#39FF14] font-mono">No critical gaps. You meet the internship skill bar — focus on applications and mock interviews.</p>
        ) : (
          <div className="space-y-4">
            {breakdown.gaps.map(gap => (
              <div key={gap.skill}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{gap.skill}</span>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded border"
                      style={{
                        color: PRIORITY_COLORS[gap.priority],
                        borderColor: `${PRIORITY_COLORS[gap.priority]}40`,
                        backgroundColor: `${PRIORITY_COLORS[gap.priority]}10`,
                      }}
                    >
                      {getPriorityLabel(gap.priority)}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#8892A4]">
                    {gap.currentScore}% → {gap.requiredScore}% · ~{gap.estimatedHours}h
                  </span>
                </div>
                <div className="h-2 bg-[#1E2D45] rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${gap.currentScore}%`,
                      backgroundColor: PRIORITY_COLORS[gap.priority],
                      boxShadow: `0 0 4px ${PRIORITY_COLORS[gap.priority]}80`,
                    }}
                  />
                  <div
                    className="absolute top-0 h-full w-0.5 bg-white/60"
                    style={{ left: `${gap.requiredScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link
          href="/skill-tree"
          className="flex items-center gap-2 bg-[#00D4FF15] hover:bg-[#00D4FF25] text-[#00D4FF] border border-[#00D4FF44] font-medium rounded-lg px-4 py-2.5 text-sm transition-all"
        >
          Close gaps on the Skill Tree <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/missions"
          className="flex items-center gap-2 text-[#8892A4] hover:text-white border border-[#1E2D45] rounded-lg px-4 py-2.5 text-sm transition-all"
        >
          Generate today&apos;s mission
        </Link>
      </div>
    </div>
  )
}
