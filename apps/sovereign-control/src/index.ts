// sovereign-control — Cloudflare Worker v0.2
// Role-gated operator control plane for Sovereign.os
// SECURITY: No credentials accepted from request body
// PRIVACY: Raw user content never logged

export interface Env {
  AI: Ai
  ENVIRONMENT?: string
  GATEWAY_ID?: string
  TEAM_DOMAIN?: string
  POLICY_AUD?: string
  GITHUB_READ_TOKEN?: string
  CF_API_TOKEN?: string
  CF_ACCOUNT_ID?: string
  // Cloudflare Browser Run binding (add when configured)
  // BROWSER?: Fetcher
}

type Role = "viewer" | "operator" | "deployer" | "admin"
type ActionStatus = "ok" | "blocked" | "not_enabled" | "error" | "requires_confirm"
type RiskLevel = "low" | "medium" | "high" | "critical"

// ── Role mapping ─────────────────────────────────────────────────────────────
// Extend this list with real operator emails before enabling Access
const ADMIN_EMAILS: string[] = [
  // "your@email.com",  // Add real admin emails here
]

function mapRole(email: string): Role {
  if (ADMIN_EMAILS.includes(email)) return "admin"
  if (email.endsWith("@defrag.app")) return "operator"
  return "viewer"
}

// ── CORS ─────────────────────────────────────────────────────────────────────
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
    headers: { "Content-Type": "application/json", ...(request ? corsHeaders(request) : {}) },
  })
}

// ── Audit logging ─────────────────────────────────────────────────────────────
// PRIVACY: Never log raw user content or sensitive payloads
// Only log: action type, tool, role, identity, status, risk, ip
function logAudit(entry: {
  role: Role
  identity: string
  action: string
  tool: string
  status: ActionStatus
  risk: RiskLevel
  ip: string
  target?: string
  logId?: string
}): string {
  const logId = crypto.randomUUID()
  console.log(JSON.stringify({
    audit: true,
    logId,
    timestamp: new Date().toISOString(),
    ...entry,
    // NEVER include: payload, content, user data, raw text
  }))
  return logId
}

// ── Identity verification ─────────────────────────────────────────────────────
async function verifyIdentity(
  request: Request,
  env: Env
): Promise<{ email: string; role: Role } | null> {
  // Development mode — no Access configured
  if (env.ENVIRONMENT === "development") {
    const devEmail = request.headers.get("X-Dev-Email") || "dev@localhost"
    return { email: devEmail, role: mapRole(devEmail) }
  }

  const token = request.headers.get("Cf-Access-Jwt-Assertion")
  if (!token) return null

  try {
    const parts = token.split(".")
    if (parts.length < 3) return null

    // Decode payload (signature verification requires TEAM_DOMAIN public keys)
    const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const payload = JSON.parse(atob(payloadB64)) as Record<string, unknown>

    // Verify expiry
    const exp = payload.exp as number
    if (exp && exp < Math.floor(Date.now() / 1000)) return null

    // Verify audience if configured
    if (env.POLICY_AUD && payload.aud !== env.POLICY_AUD) return null

    const email = payload.email as string
    if (!email) return null

    // TODO: Full signature verification against TEAM_DOMAIN public keys
    // For now, trust Access JWT structure + expiry + audience

    return { email, role: mapRole(email) }
  } catch {
    return null
  }
}

// ── Risk classification ───────────────────────────────────────────────────────
function classifyRisk(action: string, tool: string): RiskLevel {
  if (action === "deploy" || action === "rollback") return "high"
  if (["deploy_worker", "deploy_web", "rollback_worker", "delete_file"].includes(tool)) return "high"
  if (["update_file", "patch_file", "create_file"].includes(tool)) return "medium"
  if (action === "inspect") return "low"
  return "medium"
}

// ── Role requirements ─────────────────────────────────────────────────────────
const ROLE_LEVELS: Record<Role, number> = { viewer: 1, operator: 2, deployer: 3, admin: 4 }
const TOOL_ROLE_REQUIREMENTS: Record<string, Role> = {
  inspect_repo: "viewer",
  inspect_live_url: "viewer",
  capture_screenshot: "operator",
  update_file: "operator",
  create_file: "operator",
  patch_file: "operator",
  deploy_worker: "deployer",
  deploy_web: "deployer",
  rollback_worker: "deployer",
}

function hasRole(userRole: Role, required: Role): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[required]
}

// ── Inspect tools ─────────────────────────────────────────────────────────────
async function inspectRepo(env: Env, path: string, ref = "main"): Promise<unknown> {
  const token = env.GITHUB_READ_TOKEN
  if (!token) return { status: "not_enabled", message: "GITHUB_READ_TOKEN not configured as Worker secret" }

  const url = "https://api.github.com/repos/defragapp/SOVV/contents/" + path + "?ref=" + ref
  const res = await fetch(url, {
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
    return { path: fileData.path, content: content.slice(0, 50000), sha: fileData.sha, truncated: content.length > 50000 }
  }
  return data
}

async function inspectLiveUrl(url: string): Promise<unknown> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "sovereign-control/1.0" },
      redirect: "follow",
    })
    return {
      url, status: res.status, ok: res.ok,
      contentType: res.headers.get("content-type"),
      server: res.headers.get("server"),
      cfRay: res.headers.get("cf-ray"),
    }
  } catch (err) {
    return { url, status: "error", message: String(err) }
  }
}

// ── Browser Run (prepared — not yet wired) ────────────────────────────────────
async function captureScreenshot(_env: Env, _url: string): Promise<unknown> {
  // TODO: Wire Cloudflare Browser Run
  // Requires: [[browser]] binding in wrangler.toml
  // import puppeteer from "@cloudflare/puppeteer"
  // const browser = await puppeteer.launch(env.BROWSER)
  // const page = await browser.newPage()
  // await page.setViewport({ width: 1280, height: 800 })
  // await page.goto(url)
  // const screenshot = await page.screenshot({ type: "png" })
  // await browser.close()
  // Store in R2, return signed URL
  return {
    status: "not_enabled",
    message: "Browser Run not yet configured. Add [[browser]] binding to wrangler.toml and install @cloudflare/puppeteer.",
    todo: "https://developers.cloudflare.com/browser-rendering/",
  }
}

// ── AI Gateway creative panel (prepared) ──────────────────────────────────────
async function generateCreative(env: Env, prompt: string, type: string): Promise<unknown> {
  if (!env.AI) return { status: "not_enabled", message: "AI binding not configured" }

  // Text-based creative (works now)
  if (type === "concept" || type === "copy") {
    const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        { role: "system", content: "You are a premium UI/UX design consultant for Sovereign.os. Provide specific, actionable creative direction. Never auto-apply changes — always present as a proposal for human review." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
    })
    return { status: "ok", type, result, note: "Review before applying. Do not auto-apply." }
  }

  // Image generation (prepared — requires model availability)
  if (type === "image") {
    return {
      status: "not_enabled",
      message: "Image generation via @cf/leonardo/phoenix-1.0 — add to wrangler.toml AI binding",
      todo: "https://developers.cloudflare.com/workers-ai/models/phoenix-1.0/",
    }
  }

  return { status: "error", message: "Unknown creative type: " + type }
}

// ── Main fetch handler ────────────────────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) })
    }

    // Health — public, no auth
    if (url.pathname === "/health") {
      return jsonResponse({
        ok: true, service: "sovereign-control", version: "0.2.0",
        environment: env.ENVIRONMENT || "production",
        capabilities: {
          inspect: true,
          modify: false,
          deploy: !!env.CF_API_TOKEN,
          browserRun: false,
          aiCreative: !!env.AI,
        },
      }, 200, request)
    }

    // Auth required for all other routes
    const identity = await verifyIdentity(request, env)
    if (!identity) {
      return jsonResponse({ error: "Unauthorized — Cloudflare Access required", hint: "Add Cf-Access-Jwt-Assertion header" }, 401, request)
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown"

    // GET /api/inspect
    if (url.pathname === "/api/inspect" && request.method === "GET") {
      const path = url.searchParams.get("path") || ""
      const liveUrl = url.searchParams.get("url")
      const ref = url.searchParams.get("ref") || "main"

      const result = liveUrl
        ? await inspectLiveUrl(liveUrl)
        : await inspectRepo(env, path, ref)

      logAudit({ role: identity.role, identity: identity.email, action: "inspect", tool: liveUrl ? "inspect_live_url" : "inspect_repo", status: "ok", risk: "low", ip, target: liveUrl || path })
      return jsonResponse({ success: true, identity: { email: identity.email, role: identity.role }, result }, 200, request)
    }

    // POST /api/action — main action endpoint
    if (url.pathname === "/api/action" && request.method === "POST") {
      let body: Record<string, unknown>
      try { body = await request.json() as Record<string, unknown> }
      catch { return jsonResponse({ error: "Invalid JSON body" }, 400, request) }

      const action = (body.type as string) || "inspect"
      const tool = (body.tool as string) || "unknown"
      const target = (body.target as string) || undefined
      const payload = (body.payload as Record<string, unknown>) || {}
      const confirm = body.confirm === true  // Must be exactly true

      const risk = classifyRisk(action, tool)
      const requiredRole = TOOL_ROLE_REQUIREMENTS[tool] || "admin"

      // Role check
      if (!hasRole(identity.role, requiredRole)) {
        const logId = logAudit({ role: identity.role, identity: identity.email, action, tool, status: "blocked", risk, ip, target })
        return jsonResponse({ success: false, status: "blocked", message: "Role " + requiredRole + " required, you have " + identity.role, risk, requiresConfirm: false, logId }, 403, request)
      }

      // Confirm check for high-risk actions
      if ((risk === "high" || risk === "critical") && confirm !== true) {
        return jsonResponse({
          success: false, status: "requires_confirm",
          message: tool + " is high-risk and requires explicit confirm: true in the request body",
          risk, requiresConfirm: true,
          preview: { action, tool, target, risk },
        }, 200, request)
      }

      // Execute tool
      let result: unknown
      try {
        switch (tool) {
          case "inspect_repo":
            result = await inspectRepo(env, (payload.path as string) || "", (payload.ref as string) || "main")
            break
          case "inspect_live_url":
            result = await inspectLiveUrl((payload.url as string) || "")
            break
          case "capture_screenshot":
            result = await captureScreenshot(env, (payload.url as string) || "")
            break
          case "generate_creative":
            result = await generateCreative(env, (payload.prompt as string) || "", (payload.type as string) || "concept")
            break
          default:
            result = { status: "not_enabled", message: "Tool " + tool + " not yet implemented. Check sovereign-control roadmap." }
        }
      } catch (err) {
        const logId = logAudit({ role: identity.role, identity: identity.email, action, tool, status: "error", risk, ip, target })
        return jsonResponse({ success: false, status: "error", message: String(err), risk, requiresConfirm: false, logId }, 500, request)
      }

      const logId = logAudit({ role: identity.role, identity: identity.email, action, tool, status: "ok", risk, ip, target })
      return jsonResponse({ success: true, status: "ok", message: tool + " completed", risk, requiresConfirm: false, logId, identity: { email: identity.email, role: identity.role }, result }, 200, request)
    }

    // GET /api/logs
    if (url.pathname === "/api/logs") {
      return jsonResponse({
        success: true,
        message: "Audit logs are structured JSON in Workers Observability",
        logsUrl: "https://dash.cloudflare.com/workers/observability",
        note: "Filter by audit:true to see operator actions",
      }, 200, request)
    }

    return jsonResponse({ error: "Not found", availableRoutes: ["/health", "/api/inspect", "/api/action", "/api/logs"] }, 404, request)
  },
} satisfies ExportedHandler<Env>
