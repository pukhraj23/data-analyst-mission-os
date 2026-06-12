// src/lib/utils/index.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return xp.toString()
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function getDifficultyLabel(difficulty: number): string {
  const labels = ['', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert']
  return labels[difficulty] ?? 'Unknown'
}

export function getDifficultyColor(difficulty: number): string {
  const colors = ['', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']
  return colors[difficulty] ?? '#6B7280'
}

export function getROILabel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 75) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    locked: '#374151',
    available: '#F59E0B',
    in_progress: '#00D4FF',
    completed: '#39FF14',
    mastered: '#A855F7',
  }
  return colors[status] ?? '#6B7280'
}

export function getReadinessColor(score: number): string {
  if (score >= 80) return '#39FF14'
  if (score >= 60) return '#00D4FF'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}

export function getReadinessLabel(score: number): string {
  if (score >= 80) return 'Ready'
  if (score >= 60) return 'Almost Ready'
  if (score >= 40) return 'Building'
  if (score >= 20) return 'Starting'
  return 'Beginner'
}

export function getPriorityLabel(priority: 'critical' | 'high' | 'medium' | 'low'): string {
  const labels = {
    critical: '🚨 Critical',
    high: '🔴 High',
    medium: '🟡 Medium',
    low: '🟢 Low',
  }
  return labels[priority]
}

export function calculateCompletionPercentage(tasks: Array<{ status: string }>): number {
  if (tasks.length === 0) return 0
  const completed = tasks.filter(t => t.status === 'completed').length
  return Math.round((completed / tasks.length) * 100)
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function getWeekRange(): { start: string; end: string } {
  const today = new Date()
  const day = today.getDay()
  const start = new Date(today)
  start.setDate(today.getDate() - day + (day === 0 ? -6 : 1))
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

export function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateStr)
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength - 3) + '...'
}
