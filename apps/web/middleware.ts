import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  if ((host === 'defrag.app' || host === 'www.defrag.app') && pathname === '/') {
    const sessionId = request.cookies.get('__sov_session')?.value || request.cookies.get('sid')?.value;
    const hasVisited = request.cookies.get('sovv_visit')?.value;

    if (sessionId) {
      return NextResponse.redirect(new URL('https://app.defrag.app/'));
    }

    if (!hasVisited) {
      const response = NextResponse.redirect(new URL('https://sovereign.defrag.app/?ref=defrag'));
      response.cookies.set('sovv_visit', '1', {
        path: '/',
        maxAge: 31536000,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
