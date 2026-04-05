import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Env vars read at call time (not module level) so the build can collect
 * page data without throwing during static analysis.
 */
function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url) throw new Error('Missing env var NEXT_PUBLIC_SUPABASE_URL — set it in .env.local')
  if (!key) throw new Error('Missing env var NEXT_PUBLIC_SUPABASE_ANON_KEY — set it in .env.local')
  return { url, key }
}

export async function createClient() {
  const { url, key } = getSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
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
