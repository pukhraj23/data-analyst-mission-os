'use client'
// src/components/gamification/XPToastLayer.tsx
import { useAppStore } from '@/lib/store'

export function XPToastLayer() {
  const { xpToasts } = useAppStore()

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden>
      {xpToasts.map(toast => (
        <div
          key={toast.id}
          className="absolute font-mono font-bold text-[#39FF14] text-xl select-none"
          style={{
            left: toast.x,
            top: toast.y,
            transform: 'translate(-50%, -50%)',
            animation: 'xp-flash 1.2s ease-out forwards',
            textShadow: '0 0 12px rgba(57,255,20,0.9)',
          }}
        >
          +{toast.amount} XP
        </div>
      ))}
    </div>
  )
}
