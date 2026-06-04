import type { ExportedHandler } from "@cloudflare/workers-types";

// Import the OpenNext handler
// @ts-ignore — built by opennextjs-cloudflare
import nextHandler from "../.open-next/worker.js";

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const handler: ExportedHandler<{ ASSETS: Fetcher }> = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname;

    // Only intercept defrag.app and www.defrag.app root
    if ((host === 'defrag.app' || host === 'www.defrag.app') && url.pathname === '/') {
      const cookie = request.headers.get('Cookie') || '';
      const sessionId = getCookieValue(cookie, 'sid');
      const hasVisited = getCookieValue(cookie, 'sovv_visit');

      // Active session → workspace directly
      if (sessionId) {
        return Response.redirect('https://app.defrag.app/', 302);
      }

      // First time ever → Sovereign.os platform entry
      if (!hasVisited) {
        return new Response(null, {
          status: 302,
          headers: {
            'Location': 'https://sovereign.defrag.app/?ref=defrag',
            'Set-Cookie': 'sovv_visit=1; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax'
          }
        });
      }

      // Returning user, no session → fall through to OpenNext (Defrag marketing)
    }

    // Default: pass to OpenNext handler
    return nextHandler.fetch(request, env, ctx);
  }
};

export default handler;