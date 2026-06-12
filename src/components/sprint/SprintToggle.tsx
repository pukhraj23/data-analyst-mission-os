'use client'
// src/components/sprint/SprintToggle.tsx
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Zap, Loader2 } from 'lucide-react'

export function SprintToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [saving, setSaving] = useState(false)
  const { updateProfile } = useAppStore()
  const supabase = createClient()

  async function toggle() {
    setSaving(true)
    const next = !enabled
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ sprint_mode_enabled: next })
        .eq('id', user.id)
      setEnabled(next)
      updateProfile({ sprint_mode_enabled: next })
    }
    setSaving(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all border',
        enabled
          ? 'bg-[#39FF1415] text-[#39FF14] border-[#39FF1450]'
          : 'bg-[#0A0F1E] text-[#8892A4] border-[#1E2D45] hover:text-white hover:border-[#2A3F5A]'
      )}
      style={enabled ? { boxShadow: '0 0 16px rgba(57,255,20,0.25)' } : undefined}
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
      Sprint Mode: {enabled ? 'ON' : 'OFF'}
    </button>
  )
}
