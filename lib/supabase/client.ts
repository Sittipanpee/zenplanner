import { createBrowserClient } from '@supabase/ssr'

/**
 * Env vars validated at call time so the build can collect page data
 * without throwing during static analysis.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error(
      'Missing env var NEXT_PUBLIC_SUPABASE_URL. ' +
      'Add it to .env.local — see .env.example for the full list of required variables.'
    )
  }
  if (!key) {
    throw new Error(
      'Missing env var NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Add it to .env.local — see .env.example for the full list of required variables.'
    )
  }

  return createBrowserClient(url, key)
}
