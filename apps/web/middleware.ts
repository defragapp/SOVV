import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Sovereign.os platform routing middleware
 *
 * ─── CANONICAL DOMAIN HIERARCHY ───────────────────────────────────────────
 *
 * PREFERRED FINAL STATE (when sovereign.os zone is active in Cloudflare):
 *   sovereign.os          → Sovereign.os platform landing
 *   app.sovereign.os      → Authenticated Sovereign.os app shell
 *   defrag.app            → Redirects/routes to Sovereign.os landing (Defrag highlighted)
 *   app.defrag.app        → Transitional authenticated shell or Defrag-highlighted entry
 *
 * CURRENT TRANSITION STATE (sovereign.os not yet in Cloudflare account):
 *   defrag.app            → Sovereign.os platform landing (Defrag highlighted)
 *   www.defrag.app        → Same as defrag.app
 *   sovereign.defrag.app  → Temporary Sovereign.os platform entry
 *   app.defrag.app        → Authenticated Sovereign.os app shell
 *
 * Space routes (shared auth, Baseline Design, Library, subscription):
 *   /apps/defrag          → Defrag space (relational intelligence)
 *   /apps/covenant        → Covenant space (faith-context reflection)
 *
 * ──────────────────────────────────────────────────────────────────────────
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // ── sovereign.os (preferred canonical — active when zone is in Cloudflare) ──
  const isSovereignOs = host === 'sovereign.os' || host === 'www.sovereign.os';
  const isAppSovereignOs = host === 'app.sovereign.os';

  // ── defrag.app transition hosts ──
  const isDefragRoot = host === 'defrag.app' || host === 'www.defrag.app';
  const isSovereignHub = host === 'sovereign.defrag.app';
  const isAppShell = host === 'app.defrag.app';

  // ── sovereign.os → platform landing ──
  if (isSovereignOs) {
    return NextResponse.next(); // serves app/page.tsx (Sovereign.os landing)
  }

  // ── app.sovereign.os → authenticated app shell ──
  if (isAppSovereignOs) {
    const sessionId =
      request.cookies.get('__sov_session')?.value ||
      request.cookies.get('sid')?.value;

    const isPublicPath =
      pathname.startsWith('/app/login') ||
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/brand-mark');

    if (!sessionId && !isPublicPath) {
      return NextResponse.redirect(new URL('/app/login', request.url));
    }

    if (pathname === '/') {
      url.pathname = '/apps/defrag';
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // ── defrag.app / www.defrag.app → Sovereign.os platform landing (Defrag highlighted) ──
  // During transition: serves the Sovereign.os landing page.
  // When sovereign.os is active: this host should redirect to sovereign.os.
  if (isDefragRoot) {
    const sessionId =
      request.cookies.get('__sov_session')?.value ||
      request.cookies.get('sid')?.value;

    if (sessionId && pathname === '/') {
      // Authenticated user at root → send to app shell (Defrag space)
      return NextResponse.redirect(new URL('https://app.defrag.app/apps/defrag'));
    }

    // Serve Sovereign.os platform landing (Defrag highlighted) for all other requests
    return NextResponse.next();
  }

  // ── sovereign.defrag.app → temporary Sovereign.os platform entry ──
  // Use this until sovereign.os zone is active in Cloudflare.
  // When sovereign.os is active, redirect sovereign.defrag.app → sovereign.os.
  if (isSovereignHub) {
    return NextResponse.next(); // serves app/page.tsx (Sovereign.os landing)
  }

  // ── app.defrag.app → authenticated Sovereign.os app shell ──
  if (isAppShell) {
    const sessionId =
      request.cookies.get('__sov_session')?.value ||
      request.cookies.get('sid')?.value;

    const isPublicPath =
      pathname.startsWith('/app/login') ||
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/brand-mark');

    if (!sessionId && !isPublicPath) {
      return NextResponse.redirect(new URL('/app/login', request.url));
    }

    if (pathname === '/') {
      url.pathname = '/apps/defrag';
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|brand-mark.svg|social-card.svg).*)'],
};