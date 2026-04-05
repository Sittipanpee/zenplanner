import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL) {
  throw new Error(
    'Missing env var NEXT_PUBLIC_SUPABASE_URL. ' +
    'Add it to .env.local — see .env.example for the full list of required variables.'
  )
}
if (!SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing env var NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Add it to .env.local — see .env.example for the full list of required variables.'
  )
}

export function createClient() {
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
}
