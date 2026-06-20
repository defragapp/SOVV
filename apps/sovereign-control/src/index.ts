// sovereign-control — Cloudflare Worker v0.4
// Controlled development operating system for Sovereign.os
// SECURITY: No credentials from request body
// PRIVACY: Raw user content never logged
// SAFETY: Deploy blocked in safe mode (default)

export { AgentState } from './agent-state'

export interface Env {
  AI: Ai
  AGENT_STATE: DurableObjectNamespace
  ENVIRONMENT?: string
  ENVIRONMENT_MODE?: string  // "safe" (default) | "live"
  GATEWAY_ID?: string
  TEAM_DOMAIN?: string
  POLICY_AUD?: string
  GITHUB_READ_TOKEN?: string
  CF_API_TOKEN?: string
  CF_ACCOUNT_ID?: string
  DEV_MODE?: string
  // BROWSER?: Fetcher  // Add when Browser Run is configured
}

type Role = "viewer" | "operator" | "deployer" | "admin"
type ActionStatus = "ok" | "blocked" | "not_enabled" | "error" | "requires_confirm"
type RiskLevel = "low" | "medium" | "high" | "critical"

// ── Tool whitelist ────────────────────────────────────────────────────────────
// Only these tools are accepted. All others are rejected.
const ALLOWED_TOOLS = new Set([
  "inspect_repo",
  "inspect_live_url",
  "generate_creative",
  "capture_screenshot",
  "deploy_worker",
  "deploy_web",
  "rollback_worker",
])

// ── Deploy target whitelist ───────────────────────────────────────────────────
// Only these workers can be deployed via sovereign-control
const ALLOWED_DEPLOY_TARGETS = new Set([
  "sovereign-os-api",
  "sovv-web",
  "worker-ai",
  "worker-session",
  "sovereign-control",
])

// ── Role mapping ──────────────────────────────────────────────────────────────
// Add real admin emails before enabling Cloudflare Access
const ADMIN_EMAILS: string[] = [
  "defragapp@gmail.com",
  // "your@email.com",
]

function mapRole(email: string): Role {
  if (ADMIN_EMAILS.includes(email)) return "admin"
  if (email.endsWith("@defrag.app")) return "operator"
  return "viewer"
}

// ── Role requirements per tool ────────────────────────────────────────────────
const TOOL_ROLE: Record<string, Role> = {
  inspect_repo: "viewer",
  inspect_live_url: "viewer",
  generate_creative: "operator",
  capture_screenshot: "operator",
  deploy_worker: "deployer",
  deploy_web: "deployer",
  rollback_worker: "deployer",
}

const ROLE_LEVELS: Record<Role, number> = { viewer: 1, operator: 2, deployer: 3, admin: 4 }

function hasRole(userRole: Role, required: Role): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[required]
}

// ── Risk classification ───────────────────────────────────────────────────────
function classifyRisk(tool: string): RiskLevel {
  if (["deploy_worker", "deploy_web", "rollback_worker"].includes(tool)) return "high"
  if (["update_file", "patch_file", "create_file"].includes(tool)) return "medium"
  return "low"
}

// ── CORS ──────────────────────────────────────────────────────────────────────
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
// PRIVACY: Never log raw payload, user content, or sensitive text
// Only log structured metadata
async function logAudit(entry: {
  role: Role
  identity: string
  action: string
  tool: string
  status: ActionStatus
  risk: RiskLevel
  ip: string
  target?: string
  payloadHash?: string
}): Promise<string> {
  const logId = crypto.randomUUID()
  console.log(JSON.stringify({
    audit: true, logId,
    timestamp: new Date().toISOString(),
    ...entry,
    // payloadHash: hash of payload for traceability without exposing content
  }))
  return logId
}

async function hashPayload(payload: unknown): Promise<string> {
  const text = JSON.stringify(payload || {})
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16)
}

// ── Identity verification ─────────────────────────────────────────────────────
async function verifyIdentity(
  request: Request,
  env: Env
): Promise<{ email: string; role: Role } | null> {
  if (env.ENVIRONMENT === "development") {
    const devEmail = request.headers.get("X-Dev-Email") || "dev@localhost"
    return { email: devEmail, role: mapRole(devEmail) }
  }

  const token = request.headers.get("Cf-Access-Jwt-Assertion")
  if (!token) return null  // Fail closed — no token, no access

  try {
    const parts = token.split(".")
    if (parts.length < 3) return null

    const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const payload = JSON.parse(atob(payloadB64)) as Record<string, unknown>

    const exp = payload.exp as number
    if (exp && exp < Math.floor(Date.now() / 1000)) return null

    if (env.POLICY_AUD && payload.aud !== env.POLICY_AUD) return null

    const email = payload.email as string
    if (!email) return null

    // TODO: Full RS256 signature verification against TEAM_DOMAIN public keys
    // Currently trusts Access JWT structure + expiry + audience
    // Add full verification before enabling in production

    return { email, role: mapRole(email) }
  } catch {
    return null
  }
}

// ── Inspect tools ─────────────────────────────────────────────────────────────
async function inspectRepo(env: Env, path: string, ref = "main"): Promise<unknown> {
  const token = env.GITHUB_READ_TOKEN
  if (!token) {
    return {
      status: "not_enabled",
      message: "GITHUB_READ_TOKEN not configured. Run: npx wrangler secret put GITHUB_READ_TOKEN",
    }
  }

  const url = "https://api.github.com/repos/defragapp/SOVV/contents/" + encodeURIComponent(path) + "?ref=" + ref
  const res = await fetch(url, {
    headers: {
      Authorization: "Bearer " + token,
      "User-Agent": "sovereign-control/1.0",
      Accept: "application/vnd.github.v3+json",
    },
  })

  if (!res.ok) return { status: "error", message: "GitHub API: " + res.status + " for " + path }

  const data = await res.json() as unknown
  if (Array.isArray(data)) {
    return (data as Record<string, unknown>[]).map(item => ({
      name: item.name, type: item.type, path: item.path, size: item.size,
    }))
  }
  const fileData = data as Record<string, unknown>
  if (fileData.content) {
    const content = atob((fileData.content as string).replace(/\n/g, ""))
    return {
      path: fileData.path, sha: fileData.sha,
      size: fileData.size, truncated: content.length > 50000,
      content: content.slice(0, 50000),
    }
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
      cacheStatus: res.headers.get("cf-cache-status"),
    }
  } catch (err) {
    return { url, status: "error", message: String(err) }
  }
}

// ── Browser Run (Phase 5 — prepared, not yet wired) ───────────────────────────
async function captureScreenshot(_env: Env, url: string): Promise<unknown> {
  // PHASE 5 WIRING INSTRUCTIONS:
  // 1. Add to wrangler.toml:
  //    [[browser]]
  //    binding = "BROWSER"
  // 2. npm install @cloudflare/puppeteer
  // 3. Add to Env interface: BROWSER: Fetcher
  // 4. Uncomment implementation below:
  //
  // import puppeteer from "@cloudflare/puppeteer"
  // const browser = await puppeteer.launch(env.BROWSER)
  // const page = await browser.newPage()
  // await page.setViewport({ width: 1280, height: 800 })
  // await page.goto(url, { waitUntil: "networkidle0" })
  // const screenshot = await page.screenshot({ type: "png" })
  // await browser.close()
  // Store in R2 and return signed URL, or return base64 for small images
  // return { status: "ok", url, image: "data:image/png;base64," + btoa(String.fromCharCode(...new Uint8Array(screenshot))) }

  return {
    status: "not_enabled",
    message: "Browser Run not yet configured for: " + url,
    wiringSteps: [
      "1. Add [[browser]] binding = 'BROWSER' to wrangler.toml",
      "2. Run: npm install @cloudflare/puppeteer in apps/sovereign-control",
      "3. Add BROWSER: Fetcher to Env interface",
      "4. Uncomment implementation in captureScreenshot()",
    ],
    docs: "https://developers.cloudflare.com/browser-rendering/",
  }
}

// ── AI Gateway creative (Phase 6) ─────────────────────────────────────────────
async function generateCreative(env: Env, prompt: string, type: string): Promise<unknown> {
  if (!env.AI) return { status: "not_enabled", message: "AI binding not configured" }

  // Text creative — works now
  if (type === "concept" || type === "copy" || type === "feedback") {
    const systemPrompt = type === "feedback"
      ? "You are a premium UI/UX design reviewer for Sovereign.os. Provide specific, actionable feedback. Format as: ISSUE, IMPACT, SUGGESTION. Never auto-apply — always present as proposal for human review."
      : "You are a premium UI/UX design consultant for Sovereign.os. Provide specific, actionable creative direction. Format as: CONCEPT, RATIONALE, IMPLEMENTATION NOTES. Never auto-apply — always present as proposal for human review."

    const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 1500,
    })

    return {
      status: "ok", type,
      result: (result as Record<string, unknown>).response || result,
      note: "REVIEW REQUIRED: Do not auto-apply. Present to human for approval before any changes.",
    }
  }

  // Image generation — stub (Phase 6 extension)
  if (type === "image") {
    return {
      status: "not_enabled",
      message: "Image generation via @cf/leonardo/phoenix-1.0 not yet configured",
      wiringSteps: [
        "1. Verify @cf/leonardo/phoenix-1.0 is available in your account",
        "2. Call: env.AI.run('@cf/leonardo/phoenix-1.0', { prompt })",
        "3. Store result in R2, return signed URL",
        "4. Display in UI preview block — never auto-apply",
      ],
      docs: "https://developers.cloudflare.com/workers-ai/models/phoenix-1.0/",
    }
  }

  // Video — stub (future)
  if (type === "video") {
    return {
      status: "not_enabled",
      message: "Video generation not yet available in Workers AI",
      note: "Monitor: https://developers.cloudflare.com/workers-ai/models/",
    }
  }

  return { status: "error", message: "Unknown creative type: " + type + ". Use: concept, copy, feedback, image, video" }
}

// ── Deploy tools (Phase 7 — safe mode default) ────────────────────────────────
async function deployWorker(env: Env, workerName: string): Promise<unknown> {
  const mode = env.ENVIRONMENT_MODE || "safe"

  if (mode === "safe") {
    return {
      status: "not_enabled",
      message: "Deploy blocked: ENVIRONMENT_MODE is 'safe' (default). Set ENVIRONMENT_MODE=live to enable.",
      workerName,
      note: "Preferred deploy path: trigger GitHub Actions workflow instead of direct API deploy.",
    }
  }

  if (!ALLOWED_DEPLOY_TARGETS.has(workerName)) {
    return {
      status: "blocked",
      message: "Deploy target not in allowlist: " + workerName,
      allowedTargets: Array.from(ALLOWED_DEPLOY_TARGETS),
    }
  }

  const token = env.CF_API_TOKEN
  const accountId = env.CF_ACCOUNT_ID
  if (!token || !accountId) {
    return { status: "not_enabled", message: "CF_API_TOKEN and CF_ACCOUNT_ID required as Worker secrets" }
  }

  // Trigger GitHub Actions deploy (preferred — goes through CI)
  // Direct CF API deploy is available but bypasses CI checks
  return {
    status: "not_enabled",
    message: "GitHub Actions deploy trigger not yet wired. Configure GITHUB_DEPLOY_TOKEN.",
    note: "Direct CF API deploy available but bypasses CI. Prefer GitHub Actions.",
  }
}

async function rollbackWorker(env: Env, workerName: string, versionId?: string): Promise<unknown> {
  const mode = env.ENVIRONMENT_MODE || "safe"
  if (mode === "safe") {
    return { status: "not_enabled", message: "Rollback blocked: ENVIRONMENT_MODE is 'safe'" }
  }

  if (!ALLOWED_DEPLOY_TARGETS.has(workerName)) {
    return { status: "blocked", message: "Rollback target not in allowlist: " + workerName }
  }

  const token = env.CF_API_TOKEN
  const accountId = env.CF_ACCOUNT_ID
  if (!token || !accountId) {
    return { status: "not_enabled", message: "CF_API_TOKEN and CF_ACCOUNT_ID required" }
  }

  if (!versionId) {
    const url = "https://api.cloudflare.com/client/v4/accounts/" + accountId + "/workers/scripts/" + workerName + "/versions"
    const res = await fetch(url, { headers: { Authorization: "Bearer " + token } })
    const data = await res.json() as Record<string, unknown>
    return { status: "requires_confirm", message: "Specify versionId to rollback to", versions: data }
  }

  const url = "https://api.cloudflare.com/client/v4/accounts/" + accountId + "/workers/scripts/" + workerName + "/deployments"
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({ strategy: "percentage", versions: [{ version_id: versionId, percentage: 100 }] }),
  })
  const data = await res.json() as Record<string, unknown>
  return { status: res.ok ? "ok" : "error", cloudflare: data }
}

// ── Main fetch handler ────────────────────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) })
    }

    // Health — public
    if (url.pathname === "/health") {
      const mode = env.ENVIRONMENT_MODE || "safe"
      return jsonResponse({
        ok: true, service: "sovereign-control", version: "0.3.0",
        environment: env.ENVIRONMENT || "production",
        mode,
        capabilities: {
          inspect: true,
          inspectLiveUrl: true,
          generateCreative: !!env.AI,
          captureScreenshot: false,  // Browser Run not yet wired
          deploy: mode === "live" && !!env.CF_API_TOKEN,
          rollback: mode === "live" && !!env.CF_API_TOKEN,
        },
        allowedTools: Array.from(ALLOWED_TOOLS),
        allowedDeployTargets: Array.from(ALLOWED_DEPLOY_TARGETS),
      }, 200, request)
    }

    // Auth required for all other routes
    const identity = await verifyIdentity(request, env)
    if (!identity) {
      return jsonResponse({
        error: "Unauthorized",
        hint: env.ENVIRONMENT === "development"
          ? "Add X-Dev-Email header for local dev"
          : "Cloudflare Access JWT required (Cf-Access-Jwt-Assertion header)",
      }, 401, request)
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

      const logId = await logAudit({
        role: identity.role, identity: identity.email,
        action: "inspect", tool: liveUrl ? "inspect_live_url" : "inspect_repo",
        status: "ok", risk: "low", ip, target: liveUrl || path,
      })

      return jsonResponse({
        success: true, logId,
        identity: { email: identity.email, role: identity.role },
        result,
      }, 200, request)
    }

    // POST /api/action
    if (url.pathname === "/api/action" && request.method === "POST") {
      let body: Record<string, unknown>
      try { body = await request.json() as Record<string, unknown> }
      catch { return jsonResponse({ error: "Invalid JSON body" }, 400, request) }

      const action = (body.type as string) || "inspect"
      const tool = (body.tool as string) || ""
      const target = (body.target as string) || undefined
      const payload = (body.payload as Record<string, unknown>) || {}
      const confirm = body.confirm === true

      // Tool whitelist check
      if (!ALLOWED_TOOLS.has(tool)) {
        return jsonResponse({
          success: false, status: "blocked",
          message: "Tool not in allowlist: " + tool,
          allowedTools: Array.from(ALLOWED_TOOLS),
        }, 400, request)
      }

      const risk = classifyRisk(tool)
      const requiredRole = TOOL_ROLE[tool] || "admin"

      // Role check
      if (!hasRole(identity.role, requiredRole)) {
        const logId = await logAudit({
          role: identity.role, identity: identity.email,
          action, tool, status: "blocked", risk, ip, target,
          payloadHash: await hashPayload(payload),
        })
        return jsonResponse({
          success: false, status: "blocked",
          message: "Role " + requiredRole + " required, you have " + identity.role,
          risk, requiresConfirm: false, logId,
        }, 403, request)
      }

      // Confirm check for high-risk
      if ((risk === "high" || risk === "critical") && confirm !== true) {
        return jsonResponse({
          success: false, status: "requires_confirm",
          message: tool + " is high-risk. Add confirm: true to proceed.",
          risk, requiresConfirm: true,
          preview: { action, tool, target, risk, mode: env.ENVIRONMENT_MODE || "safe" },
        }, 200, request)
      }

      // Execute tool
      let result: unknown
      const payloadHash = await hashPayload(payload)

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
          case "deploy_worker":
            result = await deployWorker(env, (payload.workerName as string) || target || "")
            break
          case "rollback_worker":
            result = await rollbackWorker(env, (payload.workerName as string) || target || "", payload.versionId as string)
            break
          default:
            result = { status: "not_enabled", message: "Tool " + tool + " not implemented" }
        }
      } catch (err) {
        const logId = await logAudit({ role: identity.role, identity: identity.email, action, tool, status: "error", risk, ip, target, payloadHash })
        return jsonResponse({ success: false, status: "error", message: String(err), risk, requiresConfirm: false, logId }, 500, request)
      }

      const logId = await logAudit({ role: identity.role, identity: identity.email, action, tool, status: "ok", risk, ip, target, payloadHash })
      return jsonResponse({
        success: true, status: "ok", message: tool + " completed",
        risk, requiresConfirm: false, logId,
        identity: { email: identity.email, role: identity.role },
        result,
      }, 200, request)
    }

    // GET /api/logs
    if (url.pathname === "/api/logs") {
      return jsonResponse({
        success: true,
        message: "Audit logs are structured JSON in Workers Observability. Filter by audit:true.",
        logsUrl: "https://dash.cloudflare.com/workers/observability",
        logFormat: { audit: true, logId: "uuid", timestamp: "ISO", role: "string", identity: "email", action: "string", tool: "string", status: "string", risk: "string", ip: "string", payloadHash: "16-char hex" },
      }, 200, request)
    }

    // /db/* — Durable Object state (threads, messages, flows, audit, context)
    if (url.pathname.startsWith('/db/')) {
      const id = env.AGENT_STATE.idFromName('primary')
      const stub = env.AGENT_STATE.get(id)
      return stub.fetch(request)
    }

    return jsonResponse({
      error: "Not found",
      availableRoutes: ["/health", "/api/inspect?path=", "/api/inspect?url=", "/api/action", "/api/logs", "/db/threads", "/db/messages", "/db/flow", "/db/audit", "/db/context"],
    }, 404, request)
  },
} satisfies ExportedHandler<Env>
