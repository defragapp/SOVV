import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  const isHub = host.includes('sovereign.defrag.app')
  const isTool = host === 'defrag.app' || host === 'www.defrag.app'
  const isApp = host === 'app.defrag.app'

  if (isHub) {
    if (url.pathname === '/') {
      url.pathname = '/hub'
      return NextResponse.rewrite(url)
    }
    if (!url.pathname.startsWith('/hub') && !url.pathname.startsWith('/api')) {
      url.pathname = `/hub${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  if (isTool) {
    if (url.pathname === '/') {
      url.pathname = '/tool'
      return NextResponse.rewrite(url)
    }
    if (!url.pathname.startsWith('/tool') && !url.pathname.startsWith('/api')) {
      url.pathname = `/tool${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  if (isApp) {
    if (url.pathname === '/') {
      url.pathname = '/tool/workspace'
      return NextResponse.rewrite(url)
    }
    if (!url.pathname.startsWith('/tool') && !url.pathname.startsWith('/api')) {
      url.pathname = `/tool${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}
