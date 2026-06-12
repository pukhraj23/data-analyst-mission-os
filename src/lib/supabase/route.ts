// src/lib/supabase/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

export const createRouteClient = () =>
  createRouteHandlerClient<Database>({ cookies })
