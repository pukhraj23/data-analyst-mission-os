'use client'
// src/components/gamification/LevelUpModal.tsx
import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { LEVELS } from '@/lib/engines/xp-engine'
import { Trophy, X, ArrowRight } from 'lucide-react'

export function LevelUpModal() {
  const { levelUpData, setLevelUp } = useAppStore()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (levelUpData) {
      setVisible(true)
      // Auto-close after 8s
      const t = setTimeout(() => {
        setVisible(false)
        setTimeout(() => setLevelUp(null), 400)
      }, 8000)
      return () => clearTimeout(t)
    }
  }, [levelUpData]) // eslint-disable-line

  if (!levelUpData) return null

  const newLevel = LEVELS.find(l => l.id === levelUpData.newLevel)
  if (!newLevel) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9998] p-4"
      style={{
        background: 'rgba(10,15,30,0.85)',
        backdropFilter: 'blur(4px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
      onClick={() => { setVisible(false); setTimeout(() => setLevelUp(null), 400) }}
    >
      <div
        className="bg-[#111827] border rounded-2xl p-8 max-w-sm w-full text-center relative"
        style={{
          borderColor: `${newLevel.badge_color}60`,
          boxShadow: `0 0 60px ${newLevel.badge_color}40, 0 24px 48px rgba(0,0,0,0.6)`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => { setVisible(false); setTimeout(() => setLevelUp(null), 400) }}
          className="absolute top-4 right-4 text-[#374151] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Glow rings */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${newLevel.badge_color}15, transparent 70%)`,
          }}
        />

        {/* Icon */}
        <div
          className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 text-3xl font-bold font-mono"
          style={{
            backgroundColor: `${newLevel.badge_color}15`,
            border: `2px solid ${newLevel.badge_color}60`,
            color: newLevel.badge_color,
            boxShadow: `0 0 24px ${newLevel.badge_color}50`,
          }}
        >
          {newLevel.id}
        </div>

        <div className="relative">
          <div className="text-xs font-mono uppercase tracking-[0.2em] mb-2" style={{ color: newLevel.badge_color }}>
            Level Up!
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{newLevel.title}</h2>
          <p className="text-[#8892A4] text-sm mb-4">{newLevel.unlock_message}</p>
          <p className="text-xs font-mono text-[#8892A4]">{newLevel.description}</p>
        </div>

        <div className="relative mt-6 flex gap-2">
          <button
            onClick={() => { setVisible(false); setTimeout(() => setLevelUp(null), 400) }}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all"
            style={{
              backgroundColor: `${newLevel.badge_color}20`,
              border: `1px solid ${newLevel.badge_color}60`,
              color: newLevel.badge_color,
            }}
          >
            Keep Going <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
