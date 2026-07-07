import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const isAppShell = host === 'app.defrag.app' || host === 'sovereign.defrag.app';
  const isDefragRoot = host === 'defrag.app' || host === 'www.defrag.app';

  // ── Security headers applied to every response ──────────────────────────
  const securityHeaders: Record<string, string> = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    // microphone=(self) required for VoiceInput component
    'Permissions-Policy': 'camera=(), microphone=(self), geolocation=()',
    'Content-Security-Policy':
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.defrag.app https://challenges.cloudflare.com; " +
      "frame-src https://challenges.cloudflare.com; " +
      "object-src 'none'; " +
      "base-uri 'self';",
  };

  function applySecurityHeaders(res: NextResponse): NextResponse {
    for (const [key, value] of Object.entries(securityHeaders)) {
      res.headers.set(key, value);
    }
    return res;
  }

  // ── Session check ────────────────────────────────────────────────────────
  const sessionId =
    request.cookies.get('__sov_session')?.value ||
    request.cookies.get('sid')?.value;

  const isPublicPath =
    pathname.startsWith('/app/login') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/brand-mark') ||
    pathname.startsWith('/social-card') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/apple-touch-icon');

  // ── App shell: redirect unauthenticated users to login ───────────────────
  if (isAppShell && !sessionId && !isPublicPath) {
    const loginUrl = new URL('/app/login', request.url);
    if (pathname !== '/' && pathname !== '/app/login') {
      loginUrl.searchParams.set('return', pathname + (url.search || ''));
    }
    const redirectRes = NextResponse.redirect(loginUrl);
    redirectRes.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return applySecurityHeaders(redirectRes);
  }

  // ── App shell root → rewrite to /apps/defrag ────────────────────────────
  if (isAppShell && pathname === '/') {
    url.pathname = '/apps/defrag';
    const rewriteRes = NextResponse.rewrite(url);
    rewriteRes.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return applySecurityHeaders(rewriteRes);
  }

  // ── Marketing root: redirect logged-in users to app ─────────────────────
  if (isDefragRoot && sessionId && pathname === '/') {
    const redirectRes = NextResponse.redirect(
      new URL('https://app.defrag.app/apps/defrag')
    );
    redirectRes.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return applySecurityHeaders(redirectRes);
  }

  // ── Default: pass through with security headers ──────────────────────────
  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|assets|favicon.ico|sitemap.xml|robots.txt|brand-mark.svg|social-card.svg).*)',
  ],
};