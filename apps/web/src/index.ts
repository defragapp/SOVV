import openNextWorker from "../../.open-next/worker.js";
import type { ExecutionContext } from "@cloudflare/workers-types";

// Provide a stub interface for Env or use the generated one if it exists
interface Env {
  ASSETS: { fetch: typeof fetch };
}

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const host = url.hostname;

    // Only intercept defrag.app and www.defrag.app
    if (host === 'defrag.app' || host === 'www.defrag.app') {
      const cookie = request.headers.get('Cookie') || '';
      const sessionId = getCookieValue(cookie, '__sov_session') || getCookieValue(cookie, 'sid');
      const hasVisited = getCookieValue(cookie, 'sovv_visit');

      // Active session → workspace directly
      if (sessionId) {
        const target = new URL(url.pathname + url.search, 'https://app.defrag.app');
        return Response.redirect(target.toString(), 302);
      }

      // First time ever → Sovereign.os platform entry
      if (!hasVisited) {
        const response = Response.redirect('https://sovereign.defrag.app/?ref=defrag', 302);
        response.headers.append(
          'Set-Cookie',
          'sovv_visit=1; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax'
        );
        return response;
      }

      // Returning user, no session → serve Defrag marketing landing normally
      // Fall through to ASSETS below
    }

    // Default: serve Next.js app / static assets via OpenNext worker
    return openNextWorker.fetch(request, env, ctx);
  }
};
