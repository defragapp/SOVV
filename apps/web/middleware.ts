import { NextResponse, type NextRequest } from 'next/server';

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

  // If no session and route is not public, immediately redirect to login to intercept
  // before client-side rendering or AuthGuard
  if (isAppShell && !sessionId && !isPublicPath) {
    // Redirect to login, preserving the original path as return URL
    const loginUrl = new URL('/app/login', request.url);
    if (pathname !== '/' && pathname !== '/app/login') {
      loginUrl.searchParams.set('return', pathname + (url.search || ''));
    }
    const redirectRes = NextResponse.redirect(loginUrl);
    redirectRes.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return redirectRes;
  }

  if (isAppShell) {
    if (pathname === '/') {
      url.pathname = '/apps/defrag';
      const rewriteRes = NextResponse.rewrite(url);
      rewriteRes.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      return rewriteRes;
    }
  }

  if (isDefragRoot && sessionId && pathname === '/') {
    const redirectRes = NextResponse.redirect(new URL('https://app.defrag.app/apps/defrag'));
    redirectRes.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return redirectRes;
  }

  const res = NextResponse.next();
  // Security headers applied to all responses
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|assets|favicon.ico|sitemap.xml|robots.txt|brand-mark.svg|social-card.svg).*)'],
};
