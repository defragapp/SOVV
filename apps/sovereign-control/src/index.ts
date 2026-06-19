import type { Env } from "./types.js"
import { verifyAccess } from "./auth/access.js"
import { handleAction } from "./api/action.js"
import { inspectRepo } from "./tools/inspect/inspectRepo.js"
import { inspectLiveUrl } from "./tools/inspect/inspectLiveUrl.js"

const ALLOWED_ORIGINS = [
  "https://operator.defrag.app",
  "https://sovereign-control-ui.defrag.app",
  "http://localhost:5173", // local dev
]

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") || ""
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cf-Access-Jwt-Assertion",
    "Vary": "Origin",
  }
}

function json(data: unknown, status = 200, request?: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...(request ? corsHeaders(request) : {}),
    },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) })
    }

    // Health — public, no auth required
    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true, service: "sovereign-control", environment: env.ENVIRONMENT || "production" }, 200, request)
    }

    // All other routes require authentication
    const identity = await verifyAccess(request, env)
    if (!identity) {
      return json({ error: "Unauthorized — Cloudflare Access required" }, 401, request)
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown"

    // POST /api/action — main action endpoint
    if (url.pathname === "/api/action" && request.method === "POST") {
      const result = await handleAction(request, env, identity, ip)
      return json(result, result.success ? 200 : 400, request)
    }

    // GET /api/inspect — quick inspect shorthand
    if (url.pathname === "/api/inspect" && request.method === "GET") {
      const path = url.searchParams.get("path") || ""
      const liveUrl = url.searchParams.get("url")

      if (liveUrl) {
        const result = await inspectLiveUrl({ url: liveUrl })
        return json({ success: true, result }, 200, request)
      }

      const result = await inspectRepo(env, { path })
      return json({ success: true, result }, 200, request)
    }

    // GET /api/logs — audit log (stub)
    if (url.pathname === "/api/logs" && request.method === "GET") {
      return json({
        success: true,
        message: "Audit logs available via Workers Observability dashboard",
        logsUrl: "https://dash.cloudflare.com/workers/observability",
      }, 200, request)
    }

    return json({ error: "Not found" }, 404, request)
  },
} satisfies ExportedHandler<Env>
