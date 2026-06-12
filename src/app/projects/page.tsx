'use client'
// src/app/projects/page.tsx
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAwardXP } from '@/lib/store'
import type { Project } from '@/types'
import { cn, timeAgo } from '@/lib/utils'
import { FolderKanban, Play, CheckCircle2, Loader2, Github } from 'lucide-react'

const TEMPLATES = [
  {
    project_type: 'sql_analysis',
    title: 'SQL Business Analysis',
    description: 'E-commerce revenue and customer health review. 5 business questions answered with CTEs, joins, and window functions, plus written insights.',
    skills_used: ['SQL', 'CTEs', 'Window Functions', 'Business Analysis'],
    xp: 500,
    icon: '🗄️',
    color: '#3B82F6',
  },
  {
    project_type: 'python_eda',
    title: 'Python EDA Project',
    description: 'End-to-end exploratory data analysis: load, clean, analyze, and visualize a real dataset with Pandas, Matplotlib, and a written findings summary.',
    skills_used: ['Python', 'Pandas', 'Matplotlib', 'Data Cleaning'],
    xp: 400,
    icon: '🐍',
    color: '#F59E0B',
  },
  {
    project_type: 'dashboard',
    title: 'BI Dashboard Project',
    description: 'Executive business dashboard with KPI cards, trend lines, and slicers. Built in Power BI or any BI tool, documented with screenshots.',
    skills_used: ['Power BI', 'DAX', 'Data Visualization', 'KPIs'],
    xp: 300,
    icon: '⚡',
    color: '#EC4899',
  },
] as const

const STATUS_CLS: Record<string, string> = {
  not_started: 'bg-[#1E2D45] text-[#8892A4] border-[#1E2D45]',
  in_progress: 'bg-[#00D4FF15] text-[#00D4FF] border-[#00D4FF30]',
  review: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  completed: 'bg-[#39FF1415] text-[#39FF14] border-[#39FF1430]',
}

export default function ProjectsPage() {
  const supabase = createClient()
  const awardXP = useAwardXP()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setProjects(data ?? [])
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function startProject(template: typeof TEMPLATES[number]) {
    setBusy(template.project_type)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        project_type: template.project_type,
        title: template.title,
        description: template.description,
        status: 'in_progress',
        completion_percentage: 10,
        skills_used: [...template.skills_used],
        started_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (data) setProjects(prev => [data, ...prev])
    setBusy(null)
  }

  async function completeProject(project: Project) {
    setBusy(project.id)
    const { data } = await supabase
      .from('projects')
      .update({
        status: 'completed',
        completion_percentage: 100,
        hiring_manager_score: 75,
        completed_at: new Date().toISOString(),
      })
      .eq('id', project.id)
      .select()
      .single()
    if (data) {
      setProjects(prev => prev.map(p => p.id === project.id ? data : p))
      const xp = TEMPLATES.find(t => t.project_type === project.project_type)?.xp ?? 300
      await awardXP(xp, 'project_complete', project.id, `Project completed: ${project.title}`)
    }
    setBusy(null)
  }

  const startedTypes = new Set(projects.map(p => p.project_type))

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Portfolio Projects</h1>
        <p className="text-[#8892A4] text-sm mt-0.5 font-mono">
          Projects are the #1 differentiator for internship applicants. Build all three.
        </p>
      </div>

      {/* Templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TEMPLATES.map(t => {
          const started = startedTypes.has(t.project_type)
          return (
            <div key={t.project_type} className="mission-card p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${t.color}15`, border: `1px solid ${t.color}40` }}
                >
                  {t.icon}
                </div>
                <span className="text-xs font-mono text-[#F59E0B]">+{t.xp} XP</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{t.title}</h3>
              <p className="text-xs text-[#8892A4] leading-relaxed mb-3 flex-1">{t.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {t.skills_used.map(s => (
                  <span key={s} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0A0F1E] border border-[#1E2D45] text-[#8892A4]">
                    {s}
                  </span>
                ))}
              </div>
              <button
                onClick={() => startProject(t)}
                disabled={started || busy === t.project_type}
                className={cn(
                  'w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all border',
                  started
                    ? 'text-[#39FF14] border-[#39FF1430] bg-[#39FF1408] cursor-default'
                    : 'text-[#00D4FF] border-[#00D4FF40] bg-[#00D4FF15] hover:bg-[#00D4FF25]'
                )}
              >
                {busy === t.project_type
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : started
                  ? <><CheckCircle2 className="w-3.5 h-3.5" /> Started</>
                  : <><Play className="w-3.5 h-3.5" /> Start Project</>}
              </button>
            </div>
          )
        })}
      </div>

      {/* My projects */}
      <div>
        <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-3">My Projects</div>
        {loading ? (
          <div className="mission-card p-8 flex justify-center">
            <Loader2 className="w-5 h-5 text-[#00D4FF] animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="mission-card p-8 text-center">
            <FolderKanban className="w-8 h-8 text-[#1E2D45] mx-auto mb-2" />
            <p className="text-sm text-[#374151] font-mono">No projects yet. Start with the SQL Business Analysis.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map(p => (
              <div key={p.id} className="mission-card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{p.title}</div>
                  <div className="text-xs text-[#8892A4] font-mono mt-0.5">
                    {timeAgo(p.created_at)}
                    {p.hiring_manager_score !== null && ` · HM score ${p.hiring_manager_score}`}
                  </div>
                  <div className="h-1.5 bg-[#1E2D45] rounded-full overflow-hidden mt-2 max-w-xs">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${p.completion_percentage}%`,
                        background: p.status === 'completed'
                          ? 'linear-gradient(90deg, #22BB00, #39FF14)'
                          : 'linear-gradient(90deg, #0099BB, #00D4FF)',
                      }}
                    />
                  </div>
                </div>
                <span className={cn('text-[10px] font-mono px-2 py-0.5 rounded border flex-shrink-0', STATUS_CLS[p.status])}>
                  {p.status.replace('_', ' ').toUpperCase()}
                </span>
                {p.status === 'in_progress' && (
                  <button
                    onClick={() => completeProject(p)}
                    disabled={busy === p.id}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#39FF14] border border-[#39FF1440] bg-[#39FF1410] hover:bg-[#39FF1420] rounded-lg px-3 py-1.5 transition-all flex-shrink-0"
                  >
                    {busy === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                    Complete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
