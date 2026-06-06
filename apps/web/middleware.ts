import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Sovereign.os platform routing middleware
 *
 * Domain hierarchy:
 *   defrag.app / www.defrag.app  → Sovereign.os platform landing (with Defrag highlighted)
 *   sovereign.defrag.app         → Sovereign.os platform landing (transitional host)
 *   app.defrag.app               → Authenticated Sovereign.os app shell → /apps/defrag (default space)
 *
 * Space routes:
 *   /apps/defrag    → Defrag space (relational intelligence)
 *   /apps/covenant  → Covenant space (faith-context reflection)
 *
 * Shared across all spaces: auth, Baseline Design, Library, subscription, invites, permissions.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const isDefragRoot = host === 'defrag.app' || host === 'www.defrag.app';
  const isSovereignHub = host === 'sovereign.defrag.app';
  const isAppShell = host === 'app.defrag.app';

  // defrag.app and www.defrag.app → Sovereign.os platform landing
  // The landing page (app/page.tsx) presents Sovereign.os with Defrag highlighted.
  // Authenticated users are directed to app.defrag.app for the app shell.
  if (isDefragRoot) {
    const sessionId =
      request.cookies.get('__sov_session')?.value ||
      request.cookies.get('sid')?.value;

    if (sessionId && pathname === '/') {
      // Authenticated user at root → send to app shell (Defrag space)
      return NextResponse.redirect(new URL('https://app.defrag.app/apps/defrag'));
    }

    // All other paths on defrag.app serve the Sovereign.os platform landing normally
    return NextResponse.next();
  }

  // sovereign.defrag.app → Sovereign.os platform landing (transitional host)
  if (isSovereignHub) {
    if (pathname === '/') {
      return NextResponse.next(); // serves app/page.tsx (Sovereign.os landing)
    }
    return NextResponse.next();
  }

  // app.defrag.app → authenticated Sovereign.os app shell
  // Root redirects to Defrag space; unauthenticated users go to login
  if (isAppShell) {
    const sessionId =
      request.cookies.get('__sov_session')?.value ||
      request.cookies.get('sid')?.value;

    // Protect all app routes except login and API
    const isPublicPath =
      pathname.startsWith('/app/login') ||
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/brand-mark');

    if (!sessionId && !isPublicPath) {
      return NextResponse.redirect(new URL('/app/login', request.url));
    }

    // Root of app shell → Defrag space (default)
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