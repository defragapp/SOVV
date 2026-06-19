// sovereign-control — Cloudflare Worker
// Role-gated operator control plane for Sovereign.os

export interface Env {
  AI: Ai
  ENVIRONMENT?: string
  GATEWAY_ID?: string
  TEAM_DOMAIN?: string
  POLICY_AUD?: string
  GITHUB_READ_TOKEN?: string
  CF_API_TOKEN?: string
  CF_ACCOUNT_ID?: string
}

type Role = "viewer" | "operator" | "deployer" | "admin"

const ALLOWED_ORIGINS = [
  "https://operator.defrag.app",
  "https://sovereign-control-ui.defrag.app",
  "http://localhost:5173",
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

function jsonResponse(data: unknown, status = 200, request?: Request): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...(request ? corsHeaders(request) : {}),
    },
  })
}

function logAudit(entry: Record<string, unknown>): void {
  console.log(JSON.stringify({ audit: true, timestamp: new Date().toISOString(), ...entry }))
}

async function verifyIdentity(request: Request, env: Env): Promise<{ email: string; role: Role } | null> {
  if (env.ENVIRONMENT === "development") {
    return { email: "dev@localhost", role: "admin" }
  }
  const token = request.headers.get("Cf-Access-Jwt-Assertion")
  if (!token) return null
  try {
    const parts = token.split(".")
    if (parts.length < 2) return null
    const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const payload = JSON.parse(atob(payloadB64)) as Record<string, unknown>
    const email = payload.email as string
    if (!email) return null
    const role: Role = email.endsWith("@defrag.app") ? "admin" : "operator"
    return { email, role }
  } catch {
    return null
  }
}

async function handleInspect(env: Env, searchParams: URLSearchParams): Promise<unknown> {
  const path = searchParams.get("path") || ""
  const liveUrl = searchParams.get("url")

  if (liveUrl) {
    try {
      const res = await fetch(liveUrl, { headers: { "User-Agent": "sovereign-control/1.0" } })
      return { url: liveUrl, status: res.status, ok: res.ok, contentType: res.headers.get("content-type") }
    } catch (err) {
      return { url: liveUrl, status: "error", message: String(err) }
    }
  }

  const token = env.GITHUB_READ_TOKEN
  if (!token) return { status: "not_enabled", message: "GITHUB_READ_TOKEN not configured as Worker secret" }

  const apiUrl = "https://api.github.com/repos/defragapp/SOVV/contents/" + path + "?ref=main"
  const res = await fetch(apiUrl, {
    headers: {
      Authorization: "Bearer " + token,
      "User-Agent": "sovereign-control/1.0",
      Accept: "application/vnd.github.v3+json",
    },
  })
  if (!res.ok) return { status: "error", message: "GitHub API: " + res.status }
  const data = await res.json() as unknown
  if (Array.isArray(data)) {
    return (data as Record<string, unknown>[]).map(item => ({
      name: item.name, type: item.type, path: item.path, size: item.size,
    }))
  }
  const fileData = data as Record<string, unknown>
  if (fileData.content) {
    const content = atob((fileData.content as string).replace(/\n/g, ""))
    return { path: fileData.path, content: content.slice(0, 50000), sha: fileData.sha }
  }
  return data
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) })
    }

    if (url.pathname === "/health") {
      return jsonResponse({
        ok: true, service: "sovereign-control",
        environment: env.ENVIRONMENT || "production", version: "0.1.0",
      }, 200, request)
    }

    const identity = await verifyIdentity(request, env)
    if (!identity) {
      return jsonResponse({ error: "Unauthorized — Cloudflare Access required" }, 401, request)
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown"

    if (url.pathname === "/api/inspect" && request.method === "GET") {
      const result = await handleInspect(env, url.searchParams)
      logAudit({ role: identity.role, identity: identity.email, action: "inspect", ip })
      return jsonResponse({ success: true, result }, 200, request)
    }

    if (url.pathname === "/api/action" && request.method === "POST") {
      let body: Record<string, unknown>
      try { body = await request.json() as Record<string, unknown> }
      catch { return jsonResponse({ error: "Invalid JSON" }, 400, request) }

      const tool = (body.tool as string) || "unknown"
      const confirm = (body.confirm as boolean) || false
      const highRisk = ["deploy_worker", "deploy_web", "rollback_worker"].includes(tool)

      if (highRisk && !confirm) {
        return jsonResponse({
          success: false, status: "requires_confirm",
          message: tool + " requires confirm: true", risk: "high", requiresConfirm: true,
        }, 200, request)
      }

      const deployerTools = ["deploy_worker", "deploy_web", "rollback_worker"]
      if (deployerTools.includes(tool) && identity.role !== "deployer" && identity.role !== "admin") {
        logAudit({ role: identity.role, identity: identity.email, action: "deploy", tool, status: "blocked", ip })
        return jsonResponse({ success: false, status: "blocked", message: "deployer role required", risk: "high", requiresConfirm: false }, 403, request)
      }

      let result: unknown = { status: "not_enabled", message: "Tool " + tool + " not yet wired" }
      if (tool === "inspect_repo" || tool === "inspect_live_url") {
        const payload = (body.payload as Record<string, string>) || {}
        result = await handleInspect(env, new URLSearchParams(payload))
      }

      logAudit({ role: identity.role, identity: identity.email, action: body.type as string, tool, status: "ok", ip })
      return jsonResponse({
        success: true, status: "ok", message: tool + " completed",
        risk: highRisk ? "high" : "low", requiresConfirm: false, result,
      }, 200, request)
    }

    if (url.pathname === "/api/logs") {
      return jsonResponse({
        success: true, message: "Audit logs via Workers Observability",
        logsUrl: "https://dash.cloudflare.com/workers/observability",
      }, 200, request)
    }

    return jsonResponse({ error: "Not found" }, 404, request)
  },
} satisfies ExportedHandler<Env>
