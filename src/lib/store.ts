// src/lib/store.ts
import { create } from 'zustand'
import type { Profile, Mission, UserSkillProgress, ReadinessBreakdown } from '@/types'

interface XPToast {
  id: string
  amount: number
  x: number
  y: number
}

interface AppState {
  // Profile
  profile: Profile | null
  setProfile: (profile: Profile) => void
  updateProfile: (updates: Partial<Profile>) => void

  // Missions
  todayMission: Mission | null
  setTodayMission: (mission: Mission | null) => void
  updateMissionTask: (missionId: string, taskId: string) => void

  // Readiness
  readinessBreakdown: ReadinessBreakdown | null
  setReadinessBreakdown: (breakdown: ReadinessBreakdown) => void

  // Skill Progress
  skillProgress: UserSkillProgress[]
  setSkillProgress: (progress: UserSkillProgress[]) => void

  // UI State
  focusModeEnabled: boolean
  toggleFocusMode: () => void
  sprintModeEnabled: boolean
  toggleSprintMode: () => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void

  // XP toasts
  xpToasts: XPToast[]
  addXPToast: (amount: number, x?: number, y?: number) => void
  removeXPToast: (id: string) => void

  // Level up celebration
  levelUpData: { oldLevel: number; newLevel: number; title: string } | null
  setLevelUp: (data: AppState['levelUpData']) => void

  // Loading
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) => set(state => ({
    profile: state.profile ? { ...state.profile, ...updates } : null
  })),

  todayMission: null,
  setTodayMission: (mission) => set({ todayMission: mission }),
  updateMissionTask: (missionId, taskId) => {
    const state = get()
    if (!state.todayMission || state.todayMission.id !== missionId) return
    const updatedTasks = state.todayMission.tasks.map(t =>
      t.id === taskId ? { ...t, status: 'completed' as const } : t
    )
    set({
      todayMission: { ...state.todayMission, tasks: updatedTasks }
    })
  },

  readinessBreakdown: null,
  setReadinessBreakdown: (breakdown) => set({ readinessBreakdown: breakdown }),

  skillProgress: [],
  setSkillProgress: (progress) => set({ skillProgress: progress }),

  focusModeEnabled: false,
  toggleFocusMode: () => set(state => ({ focusModeEnabled: !state.focusModeEnabled })),

  sprintModeEnabled: false,
  toggleSprintMode: () => set(state => ({ sprintModeEnabled: !state.sprintModeEnabled })),

  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  xpToasts: [],
  addXPToast: (amount, x = window.innerWidth / 2, y = window.innerHeight / 2) => {
    const id = `xp_${Date.now()}_${Math.random()}`
    set(state => ({
      xpToasts: [...state.xpToasts, { id, amount, x, y }]
    }))
    setTimeout(() => {
      set(state => ({ xpToasts: state.xpToasts.filter(t => t.id !== id) }))
    }, 1500)
  },

  levelUpData: null,
  setLevelUp: (data) => set({ levelUpData: data }),

  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
}))

// Hook to award XP with all side effects
export function useAwardXP() {
  const { addXPToast, updateProfile, setLevelUp } = useAppStore()

  return async (
    amount: number,
    type: string,
    referenceId?: string,
    description?: string
  ) => {
    try {
      const res = await fetch('/api/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, type, referenceId, description }),
      })
      const data = await res.json()

      if (data.success) {
        addXPToast(data.data.xpAwarded)

        updateProfile({
          total_xp: data.data.newTotalXP,
          current_xp: data.data.newCurrentXP,
          current_level: data.data.newLevel.id,
          xp_to_next_level: data.data.xpToNextLevel,
          current_streak: data.data.newStreak,
        })

        if (data.data.leveledUp) {
          setLevelUp({
            oldLevel: data.data.newLevel.id - 1,
            newLevel: data.data.newLevel.id,
            title: data.data.newLevel.title,
          })
        }

        return data.data
      }
    } catch (err) {
      console.error('XP award failed:', err)
    }
  }
}
