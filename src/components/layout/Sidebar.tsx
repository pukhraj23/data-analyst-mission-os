'use client'
// src/components/layout/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn, formatXP, getReadinessColor } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { getLevelForXP, getLevelProgress } from '@/lib/engines/xp-engine'
import {
  LayoutDashboard,
  Target,
  GitBranch,
  FolderKanban,
  Mic2,
  BarChart3,
  MessageSquare,
  Compass,
  Zap,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  Settings,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard, shortLabel: 'HQ' },
  { href: '/missions', label: 'Missions', icon: Target, shortLabel: 'OPS' },
  { href: '/skill-tree', label: 'Skill Tree', icon: GitBranch, shortLabel: 'SKL' },
  { href: '/projects', label: 'Projects', icon: FolderKanban, shortLabel: 'PRJ' },
  { href: '/interviews', label: 'Interviews', icon: Mic2, shortLabel: 'INT' },
  { href: '/coach', label: 'AI Coach', icon: MessageSquare, shortLabel: 'AI' },
  { href: '/career-gps', label: 'Career GPS', icon: Compass, shortLabel: 'GPS' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, shortLabel: 'ANA' },
  { href: '/sprint', label: 'Sprint Mode', icon: Zap, shortLabel: 'SPT' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile, sidebarCollapsed, setSidebarCollapsed } = useAppStore()

  const level = profile ? getLevelForXP(profile.total_xp) : null
  const levelProgress = profile ? getLevelProgress(profile.total_xp) : 0
  const internshipColor = getReadinessColor(profile?.internship_readiness_score ?? 0)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300',
        'bg-[#0F1629] border-r border-[#1E2D45]',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center border-b border-[#1E2D45] h-16',
        sidebarCollapsed ? 'justify-center px-2' : 'px-5 gap-3'
      )}>
        <div className="w-8 h-8 rounded-md bg-[#00D4FF22] border border-[#00D4FF44] flex items-center justify-center flex-shrink-0">
          <span className="text-[#00D4FF] font-mono font-bold text-sm">DA</span>
        </div>
        {!sidebarCollapsed && (
          <div>
            <div className="text-white font-semibold text-sm leading-tight">Mission OS</div>
            <div className="text-[#8892A4] text-xs font-mono">Data Analyst</div>
          </div>
        )}
      </div>

      {/* Profile Summary */}
      {!sidebarCollapsed && profile && (
        <div className="p-4 border-b border-[#1E2D45]">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0"
              style={{ backgroundColor: `${level?.badge_color}22`, border: `1px solid ${level?.badge_color}66`, color: level?.badge_color }}
            >
              {profile.current_level}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">{profile.full_name ?? 'Analyst'}</div>
              <div className="text-[#8892A4] text-xs font-mono truncate">{level?.title}</div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#8892A4]">{formatXP(profile.total_xp)} XP</span>
              <span className="text-[#00D4FF]">{levelProgress}%</span>
            </div>
            <div className="h-1.5 bg-[#1E2D45] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${levelProgress}%`,
                  background: 'linear-gradient(90deg, #0099BB, #00D4FF)',
                  boxShadow: '0 0 6px rgba(0, 212, 255, 0.6)',
                }}
              />
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2 mt-2.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-mono text-orange-400">{profile.current_streak} day streak</span>
            <span className="ml-auto text-xs font-mono" style={{ color: internshipColor }}>
              {profile.internship_readiness_score}% ready
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md transition-all duration-150',
                sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                isActive
                  ? 'bg-[#00D4FF15] text-[#00D4FF] border border-[#00D4FF33]'
                  : 'text-[#8892A4] hover:text-white hover:bg-[#ffffff08]'
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className={cn('flex-shrink-0', sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4')} />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {sidebarCollapsed && (
                <span className="sr-only">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t border-[#1E2D45] space-y-1">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-md text-[#8892A4] hover:text-white hover:bg-[#ffffff08] transition-all duration-150',
            sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
          )}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-sm">Settings</span>}
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            'w-full flex items-center gap-3 rounded-md text-[#8892A4] hover:text-white hover:bg-[#ffffff08] transition-all duration-150',
            sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
