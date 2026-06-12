// src/app/sprint/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { classifySkillForSprint } from '@/lib/engines/readiness-engine'
import { SprintToggle } from '@/components/sprint/SprintToggle'
import { getStatusColor } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const COLUMNS = [
  { key: 'must_learn', label: 'Must Learn', color: '#39FF14', desc: 'Highest interview + market ROI. Do these first.' },
  { key: 'useful_later', label: 'Useful Later', color: '#F59E0B', desc: 'Valuable, but not on the internship critical path.' },
  { key: 'ignore_for_now', label: 'Ignore For Now', color: '#6B7280', desc: 'Skip until you have offers. Zero sprint value.' },
] as const

export default async function SprintPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, nodesRes, progressRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('skill_nodes').select('*').order('sort_order'),
    supabase.from('user_skill_progress').select('*').eq('user_id', user.id),
  ])

  const profile = profileRes.data
  const nodes = nodesRes.data ?? []
  const progress = progressRes.data ?? []

  const classified = nodes.map((node: {
    id: string; name: string; domain_id: string
    career_value_score: number; interview_frequency_score: number
    market_demand_score: number; is_sprint_essential: boolean; estimated_minutes: number
  }) => ({
    node,
    classification: classifySkillForSprint(
      node.id,
      node.career_value_score,
      node.interview_frequency_score,
      node.market_demand_score,
      node.is_sprint_essential
    ),
    status: progress.find((p: { skill_node_id: string }) => p.skill_node_id === node.id)?.status ?? 'locked',
  }))

  const mustLearn = classified.filter(c => c.classification === 'must_learn')
  const mustLearnDone = mustLearn.filter(c => c.status === 'completed' || c.status === 'mastered').length
  const sprintMinutesLeft = mustLearn
    .filter(c => c.status !== 'completed' && c.status !== 'mastered')
    .reduce((s, c) => s + c.node.estimated_minutes, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sprint Mode</h1>
          <p className="text-[#8892A4] text-sm mt-0.5 font-mono">
            The 80/20 cut. When Sprint Mode is on, missions only target Must Learn skills.
          </p>
        </div>
        <SprintToggle initialEnabled={profile?.sprint_mode_enabled ?? false} />
      </div>

      {/* Sprint progress */}
      <div className="mission-card p-5">
        <div className="flex justify-between text-xs font-mono text-[#8892A4] mb-2">
          <span>Sprint completion · {mustLearnDone}/{mustLearn.length} essential skills</span>
          <span className="text-[#39FF14]">
            ~{Math.round(sprintMinutesLeft / 60)}h of essential work remaining
          </span>
        </div>
        <div className="h-2.5 bg-[#1E2D45] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${mustLearn.length ? (mustLearnDone / mustLearn.length) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #22BB00, #39FF14)',
              boxShadow: '0 0 8px rgba(57,255,20,0.5)',
            }}
          />
        </div>
      </div>

      {/* Classification columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const items = classified.filter(c => c.classification === col.key)
          return (
            <div key={col.key} className="mission-card p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold" style={{ color: col.color }}>{col.label}</span>
                <span className="text-xs font-mono text-[#374151]">{items.length}</span>
              </div>
              <p className="text-[11px] text-[#8892A4] mb-3 leading-relaxed">{col.desc}</p>
              <div className="space-y-1.5 max-h-[28rem] overflow-y-auto pr-1">
                {items.map(({ node, status }) => {
                  const isDone = status === 'completed' || status === 'mastered'
                  return (
                    <div
                      key={node.id}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-[#0A0F1E] border border-[#1E2D45]"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getStatusColor(status) }}
                      />
                      <span className={`text-xs flex-1 truncate ${isDone ? 'line-through text-[#374151]' : 'text-[#8892A4]'}`}>
                        {node.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#374151] flex-shrink-0">
                        {node.interview_frequency_score}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
