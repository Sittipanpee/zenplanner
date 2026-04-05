import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL) {
  throw new Error('Missing env var NEXT_PUBLIC_SUPABASE_URL — set it in .env.local')
}
if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing env var NEXT_PUBLIC_SUPABASE_ANON_KEY — set it in .env.local')
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // Called from a Server Component where cookies are read-only.
            // This is expected behavior in RSC — the session will be refreshed
            // on the next request that can write cookies (middleware or route handler).
            if (process.env.DEBUG_MODE === 'true') {
              console.warn('[DBG][supabase/server] Could not set cookies (likely RSC context):', error)
            }
          }
        },
      },
    }
  )
}
