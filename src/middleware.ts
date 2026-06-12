// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/']
const AUTH_ROUTES = ['/auth/login', '/auth/register']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Redirect authenticated users away from auth pages
  if (session && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect unauthenticated users to login
  if (!session && !PUBLIC_ROUTES.includes(pathname)) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}
