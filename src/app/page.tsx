// src/app/page.tsx
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function RootPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  redirect(session ? '/dashboard' : '/auth/login')
}
