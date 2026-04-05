import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })

  // Supabase session refresh
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => cookies.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        }),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protected routes — require authentication
  const protectedPaths = ['/dashboard', '/blueprint', '/generate', '/profile', '/tools', '/stats', '/settings', '/payment']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Auth routes — redirect to dashboard if already logged in
  const authPaths = ['/login', '/signup']
  const isAuth = authPaths.some(p => pathname.startsWith(p))
  if (isAuth && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // NEXT_LOCALE cookie — set default 'en' if missing
  const locale = request.cookies.get('NEXT_LOCALE')?.value
  if (!locale) {
    response.cookies.set('NEXT_LOCALE', 'en', { path: '/', sameSite: 'lax' })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
