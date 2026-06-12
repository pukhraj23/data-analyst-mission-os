'use client'
// src/components/dashboard/ReadinessGauge.tsx
import { getReadinessLabel, getReadinessColor } from '@/lib/utils'

interface ReadinessGaugeProps {
  internshipScore: number
  jobScore: number
  interviewScore: number
}

function CircularGauge({ value, color, size = 90, strokeWidth = 8 }: {
  value: number; color: string; size?: number; strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="#1E2D45" strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 6px ${color}88)`,
          transition: 'stroke-dashoffset 1s ease-in-out',
        }}
      />
    </svg>
  )
}

export function ReadinessGauge({ internshipScore, jobScore, interviewScore }: ReadinessGaugeProps) {
  const color = getReadinessColor(internshipScore)
  const label = getReadinessLabel(internshipScore)

  return (
    <div className="mission-card p-5 h-full">
      <div className="text-xs font-mono text-[#8892A4] uppercase tracking-wider mb-4">Readiness Status</div>

      {/* Main gauge */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative">
          <CircularGauge value={internshipScore} color={color} size={100} strokeWidth={9} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-mono" style={{ color }}>
              {internshipScore}
            </span>
            <span className="text-[9px] font-mono text-[#8892A4] uppercase tracking-wider">score</span>
          </div>
        </div>
        <div className="mt-2 text-center">
          <div className="text-sm font-semibold" style={{ color }}>{label}</div>
          <div className="text-xs text-[#8892A4] font-mono">Internship Ready</div>
        </div>
      </div>

      {/* Sub-scores */}
      <div className="space-y-2.5">
        <SubScore label="Interview" value={interviewScore} color="#8B5CF6" />
        <SubScore label="Job Offer" value={jobScore} color="#F59E0B" />
      </div>
    </div>
  )
}

function SubScore({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-[#8892A4]">{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-[#1E2D45] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${value}%`,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}88`,
          }}
        />
      </div>
    </div>
  )
}
