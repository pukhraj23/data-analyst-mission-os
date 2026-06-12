'use client'
// src/app/auth/login/page.tsx
import { Suspense } from 'react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, ArrowRight, Database } from 'lucide-react'

function LoginContent() {  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-4">
      {/* Grid bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#00D4FF15] border border-[#00D4FF33] mb-4">
            <Database className="w-7 h-7 text-[#00D4FF]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Data Analyst Mission OS</h1>
          <p className="text-[#8892A4] text-sm mt-1 font-mono">Sign in to your command center</p>
        </div>

        {/* Card */}
        <div
          className="bg-[#111827] border border-[#1E2D45] rounded-xl p-8"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.05)' }}
        >
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#8892A4] uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="analyst@example.com"
                className="w-full bg-[#0A0F1E] border border-[#1E2D45] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#374151] focus:outline-none focus:border-[#00D4FF66] focus:ring-1 focus:ring-[#00D4FF33] transition-all font-mono"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#8892A4] uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#0A0F1E] border border-[#1E2D45] rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-[#374151] focus:outline-none focus:border-[#00D4FF66] focus:ring-1 focus:ring-[#00D4FF33] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#374151] hover:text-[#8892A4]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 font-mono">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#00D4FF] hover:bg-[#00B8E0] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0F1E] font-semibold rounded-lg px-4 py-2.5 text-sm transition-all"
              style={{ boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Enter Mission Control
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#1E2D45] text-center">
            <p className="text-sm text-[#8892A4]">
              No account?{' '}
              <Link href="/auth/register" className="text-[#00D4FF] hover:text-[#00B8E0] font-medium transition-colors">
                Start your mission
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}