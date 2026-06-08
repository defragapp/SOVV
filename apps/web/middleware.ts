import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Set the proper domain configurations for session cookies
  const response = NextResponse.next();
  const originUrl = new URL(request.url);

  // ── session checking ──
  const sessionId = request.cookies.get('__sov_session')?.value || request.cookies.get('sid')?.value;
  
  const isAppShell = host === 'app.defrag.app';
  const isDefragRoot = host === 'defrag.app' || host === 'www.defrag.app';
  
  const isPublicPath =
    pathname.startsWith('/app/login') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/brand-mark') ||
    pathname.startsWith('/social-card');

  if (isAppShell) {
    if (!sessionId && !isPublicPath) {
      return NextResponse.redirect(new URL('/app/login', request.url));
    }
    if (pathname === '/') {
      url.pathname = '/apps/defrag';
      return NextResponse.rewrite(url);
    }
  }

  if (isDefragRoot && sessionId && pathname === '/') {
    return NextResponse.redirect(new URL('https://app.defrag.app/apps/defrag'));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|assets|favicon.ico|sitemap.xml|robots.txt|brand-mark.svg|social-card.svg).*)'],
};
