'use client'
// src/components/layout/AppShell.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layout/Sidebar'
import { XPToastLayer } from '@/components/gamification/XPToastLayer'
import { LevelUpModal } from '@/components/gamification/LevelUpModal'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, setProfile, profile } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    async function bootstrap() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData && mounted) setProfile(profileData)

      // Safety: ensure skill progress rows exist (covers signups where
      // the register-time init call ran before a session existed)
      const { count } = await supabase
        .from('user_skill_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if ((count ?? 0) === 0) {
        await fetch('/api/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'initialize' }),
        })
      }
    }

    if (!profile) bootstrap()
    return () => { mounted = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <Sidebar />
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'pl-16' : 'pl-64'
        )}
      >
        <div className="p-6 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
      <XPToastLayer />
      <LevelUpModal />
    </div>
  )
}
