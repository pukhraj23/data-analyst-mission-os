'use client'
// src/app/settings/page.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Loader2, Save, LogOut, Zap, Crosshair, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { updateProfile, setProfile } = useAppStore()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [email, setEmail] = useState('')

  const [fullName, setFullName] = useState('')
  const [studyGoal, setStudyGoal] = useState(60)
  const [targetDate, setTargetDate] = useState('')
  const [sprintMode, setSprintMode] = useState(false)
  const [focusMode, setFocusMode] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setEmail(user.email ?? '')

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setFullName(data.full_name ?? '')
        setStudyGoal(data.study_goal_minutes_per_day ?? 60)
        setTargetDate(data.target_internship_date ?? '')
        setSprintMode(data.sprint_mode_enabled ?? false)
        setFocusMode(data.focus_mode_enabled ?? false)
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    setSaving(true)
    setSaved(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const updates = {
      full_name: fullName,
      study_goal_minutes_per_day: studyGoal,
      target_internship_date: targetDate || null,
      sprint_mode_enabled: sprintMode,
      focus_mode_enabled: focusMode,
    }

    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (data) {
      setProfile(data)
      updateProfile(updates)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  async function signOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex justify-center pt-24">
        <Loader2 className="w-6 h-6 text-[#00D4FF] animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-[#8892A4] text-sm mt-0.5 font-mono">{email}</p>
      </div>

      {/* Profile */}
      <div className="mission-card p-5 space-y-4">
        <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider">Profile</div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono text-[#8892A4] uppercase tracking-wider">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full bg-[#0A0F1E] border border-[#1E2D45] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF44] transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#8892A4] uppercase tracking-wider">
              Daily Study Goal (min)
            </label>
            <input
              type="number"
              min={15}
              max={480}
              step={15}
              value={studyGoal}
              onChange={e => setStudyGoal(Number(e.target.value))}
              className="w-full bg-[#0A0F1E] border border-[#1E2D45] rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#00D4FF44] transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#8892A4] uppercase tracking-wider">
              Target Internship Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full bg-[#0A0F1E] border border-[#1E2D45] rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#00D4FF44] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Modes */}
      <div className="mission-card p-5 space-y-3">
        <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider">Modes</div>

        <ModeToggle
          icon={<Zap className="w-4 h-4" />}
          label="Sprint Mode"
          description="Missions only target Must-Learn skills — the 80/20 internship path."
          enabled={sprintMode}
          color="#39FF14"
          onToggle={() => setSprintMode(v => !v)}
        />
        <ModeToggle
          icon={<Crosshair className="w-4 h-4" />}
          label="Focus Mode"
          description="One task at a time. Hides everything except the current mission task."
          enabled={focusMode}
          color="#00D4FF"
          onToggle={() => setFocusMode(v => !v)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-[#00D4FF] hover:bg-[#00B8E0] disabled:opacity-60 text-[#0A0F1E] font-semibold rounded-lg px-5 py-2.5 text-sm transition-all"
          style={{ boxShadow: '0 0 16px rgba(0,212,255,0.4)' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved' : 'Save Changes'}
        </button>
        <button
          onClick={signOut}
          disabled={signingOut}
          className="flex items-center gap-2 text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded-lg px-5 py-2.5 text-sm font-medium transition-all ml-auto"
        >
          {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          Sign Out
        </button>
      </div>
    </div>
  )
}

function ModeToggle({ icon, label, description, enabled, color, onToggle }: {
  icon: React.ReactNode
  label: string
  description: string
  enabled: boolean
  color: string
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#0A0F1E] border border-[#1E2D45] hover:border-[#2A3F5A] transition-all text-left"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          color: enabled ? color : '#374151',
          backgroundColor: enabled ? `${color}15` : '#111827',
          border: `1px solid ${enabled ? `${color}40` : '#1E2D45'}`,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-[#8892A4] leading-relaxed">{description}</div>
      </div>
      <div
        className={cn('w-10 h-5.5 rounded-full p-0.5 transition-all flex-shrink-0 flex items-center')}
        style={{
          backgroundColor: enabled ? `${color}30` : '#1E2D45',
          border: `1px solid ${enabled ? `${color}60` : '#1E2D45'}`,
          height: '22px',
        }}
      >
        <div
          className="w-4 h-4 rounded-full transition-all"
          style={{
            backgroundColor: enabled ? color : '#374151',
            transform: enabled ? 'translateX(18px)' : 'translateX(0)',
            boxShadow: enabled ? `0 0 6px ${color}80` : 'none',
          }}
        />
      </div>
    </button>
  )
}
