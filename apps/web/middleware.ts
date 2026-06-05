import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const messionToken = request.cookies.get('session_token')?.value
  const { pathname } = request.nextUrl

  // 1. Auth Gate: Redirect to login if session token is missing
  if (!sessionToken && pathname !== '/login' && pathname !== '/signup') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Stripe Gate for /defrag
  if (pathname.startsWith('/defrag')) {
    // We check the tier via a secure cookie or a fast edge fetch
    const userTier = request.cookies.get('user_tier')?.value

    if (!userTier) {
      // No tier selected, route to pricing
      return NextResponse.redirect(new URL('/pricing', request.url))
    }

    if (userTier === 'free') {
      // Potential rewrite for limited view could happen here
      // For now, allow navigation
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|login|signup|pricing).*)',
  ],
}
