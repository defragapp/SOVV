import { writeAuditLog } from "./utils/audit.js";
// Password hashing - PBKDF2 with SHA-512 via Web Crypto API
const PBKDF2_ITERATIONS = 100_000
const SALT_LENGTH = 32
const KEY_LENGTH = 64

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const encoder = new TextEncoder()
  
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  )

  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-512" },
    keyMaterial,
    KEY_LENGTH * 8
  )

  const hashArray = new Uint8Array(derivedBits)
  const hashB64 = btoa(String.fromCharCode(...hashArray))
  const saltB64 = btoa(String.fromCharCode(...salt))

  return `${PBKDF2_ITERATIONS}:${saltB64}:${hashB64}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (typeof stored !== "string" || !stored.includes(":")) return false

  const parts = stored.split(":")
  const iterStr = parts[0] ?? "100000"
  const saltB64 = parts[1] ?? ""
  const hashB64 = parts[2] ?? ""
  const parsedIterations = parseInt(iterStr, 10)
  const iterations = Number.isFinite(parsedIterations) && parsedIterations > 0 ? parsedIterations : PBKDF2_ITERATIONS

  try {
    const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0))
    const expectedHash = Uint8Array.from(atob(hashB64), (c) => c.charCodeAt(0))
    const encoder = new TextEncoder()

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    )

    const actualHash = new Uint8Array(await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations, hash: "SHA-512" },
      keyMaterial,
      KEY_LENGTH * 8
    ))

    if (actualHash.length !== expectedHash.length) return false
    let diff = 0
    for (let i = 0; i < actualHash.length; i++) {
      diff |= (actualHash[i] ?? 0) ^ (expectedHash[i] ?? 0)
    }
    return diff === 0
  } catch (error) {
    logSafetyEvent({
      level: "warn",
      event: "password_verification_failed",
      endpoint: "auth",
      requestId: "internal",
      reason: "unknown_failure",
      error,
    })
    return false
  }
}

export function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(48))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

function cookieDomain(envCookieDomain?: string): string | null {
  const d = (envCookieDomain ?? "").trim()
  return d ? d : null
}

export function sessionCookie(
  token: string,
  maxAge = 7 * 24 * 60 * 60,
  cookieDomainValue?: string,
): string {
  const domain = cookieDomain(cookieDomainValue)
  return [
    `__sov_session=${token}`,
    `Max-Age=${maxAge}`,
    "Path=/",
    ...(domain ? [`Domain=${domain}`] : []),
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ")
}

export function clearCookie(cookieDomainValue?: string): string {
  const domain = cookieDomain(cookieDomainValue)
  return [
    "__sov_session=",
    "Max-Age=0",
    "Path=/",
    ...(domain ? [`Domain=${domain}`] : []),
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ")
}

/** Non-HttpOnly cookie readable by Next.js middleware for entitlement checks. */
export function tierCookie(tier: string, maxAge = 7 * 24 * 60 * 60): string {
  return [
    `__sov_tier=${encodeURIComponent(tier || "free")}`,
    `Max-Age=${maxAge}`,
    "Path=/",
    "Domain=.defrag.app",
    "Secure",
    "SameSite=Lax",
  ].join("; ")
}

/** Non-HttpOnly cookie readable by Next.js middleware for role checks. */
export function roleCookie(role: string, maxAge = 7 * 24 * 60 * 60): string {
  return [
    `__sov_role=${encodeURIComponent(role || "user")}`,
    `Max-Age=${maxAge}`,
    "Path=/",
    "Domain=.defrag.app",
    "Secure",
    "SameSite=Lax",
  ].join("; ")
}


export function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get("Cookie")
  if (!cookie) return null
  const match = cookie.match(/__sov_session=([^;]+)/)
  return match ? (match[1] ?? null) : null
}

import type { D1Database } from "@cloudflare/workers-types";
import { getCorsHeaders } from "./cors.js";
import { getSessionId } from "./plan.js";
import { logSafetyEvent } from "./safety.js";

export function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  })
}

export type AuthUser = {
  id: string
  email: string
  tier: string
  role: string
  stripe_customer_id: string | null | undefined
  subscription_status: string
}

export function generatePromoCode(length = 10): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")
}

export async function getAuthUser(request: Request, DB: D1Database): Promise<AuthUser | null> {
  const token = getSessionToken(request)
  if (!token) return null

  const session = await DB.prepare(
    "SELECT u.id, u.email, u.tier, u.role, u.stripe_customer_id, COALESCE(u.subscription_status, 'free') as subscription_status FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?"
  )
    .bind(token, Date.now())
    .first<{
      id: string
      email: string
      tier: string
      role: string | null
      stripe_customer_id: string | null
      subscription_status: string | null
    }>()

  if (!session) return null

  // Update last_active non-blocking
  DB.prepare("UPDATE sessions SET last_active = ? WHERE token = ?")
    .bind(Date.now(), token).run().catch((error) => {
      logSafetyEvent({
        level: "warn",
        event: "session_last_active_update_failed",
        request,
        error_type: "auth",
        error,
      })
    })

  return {
    id: session.id,
    email: session.email,
    tier: session.tier,
    role: session.role || "user",
    stripe_customer_id: session.stripe_customer_id,
    subscription_status: session.subscription_status || "free",
  }
}

const SESSION_TTL = 7 * 24 * 60 * 60

export async function registerAuthRoutes(router: any, getEnv: () => any) {
  // POST /api/auth/register
  router.post("/api/auth/register", async (request: Request) => {
    const env = getEnv()
    try {
      // Rate limit registration by IP
      if (env.RATE_LIMITER) {
        const ip = request.headers.get("CF-Connecting-IP") || "unknown"
        const { success } = await env.RATE_LIMITER.limit({ key: `register:${ip}` })
        if (!success) return new Response(
          JSON.stringify({ error: "Too many registration attempts. Please wait before trying again." }),
          { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
        )
      }
      const { email: rawRegEmail, password, turnstileToken } = await request.json() as any
      const email = typeof rawRegEmail === "string" ? rawRegEmail.toLowerCase().trim() : ""
      if (!email || !password) return jsonResponse({ error: "Missing fields" }, 400)
      if (typeof password === "string" && password.length < 8) return jsonResponse({ error: "Password must be at least 8 characters" }, 400)
      if (typeof email === "string" && !email.includes("@")) return jsonResponse({ error: "Invalid email address" }, 400)

      if (env.TURNSTILE_SECRET_KEY) {
        const isHuman = await verifyTurnstile(String(turnstileToken ?? ""), env.TURNSTILE_SECRET_KEY, request)
        if (!isHuman) return jsonResponse({ error: "Bot verification failed" }, 403)
      } else {
        logSafetyEvent({
          level: "warn",
          event: "turnstile_secret_missing",
          request,
          error_type: "auth",
        })
      }

      const password_hash = await hashPassword(password)
      const userId = crypto.randomUUID()
      const now = Date.now()

      await env.DB.prepare("INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)")
        .bind(userId, email, password_hash, now)
        .run()

      const token = generateSessionToken()
      await env.DB.prepare("INSERT INTO sessions (token, user_id, expires_at, expires, created_at) VALUES (?, ?, ?, ?, ?)")
        .bind(token, userId, now + SESSION_TTL * 1000, now + SESSION_TTL * 1000, now)
        .run()

      // Send welcome email via queue (non-blocking)
      if (env.QUEUE) {
        void env.QUEUE.send({ type: "welcome", to: email }).catch((err: unknown) =>
          logSafetyEvent({
            level: "warn",
            event: "auth_welcome_email_queue_failed",
            request,
            error_type: "auth",
            error: err,
            details: { recipient: email },
          })
        )
      } else if (env.RESEND_API_KEY) {
        // Fallback: send directly if no queue
        const { sendWelcomeEmail } = await import("./email.js")
        void sendWelcomeEmail(email, { resendApiKey: env.RESEND_API_KEY }).catch((err: unknown) =>
          logSafetyEvent({
            level: "warn",
            event: "auth_welcome_email_failed",
            request,
            error_type: "auth",
            error: err,
            details: { recipient: email },
          })
        )
      }

      // Trigger email verification non-blocking (only if RESEND configured)
      if (env.RESEND_API_KEY) {
        const appUrl = env.APP_URL || "https://app.defrag.app"
        void fetch(`${appUrl}/api/auth/send-verification`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Cookie": `session=${token}` },
          body: JSON.stringify({ email }),
        }).catch((error) => {
          logSafetyEvent({
            level: "warn",
            event: "auth_send_verification_trigger_failed",
            request,
            error_type: "auth",
            error,
            details: { recipient: email },
          })
        })
      }

      return jsonResponse({ success: true, token }, 200, {
        "Set-Cookie": sessionCookie(token, 7 * 24 * 60 * 60, env.COOKIE_DOMAIN),
      })
    } catch (e: any) {
      if (e?.message?.includes("UNIQUE")) return jsonResponse({ error: "An account with this email already exists." }, 400)
      logSafetyEvent({ level: "error", event: "auth_registration_failed", request, error_type: "auth", error: e })
      return jsonResponse({ error: "Registration failed" }, 500)
    }
  })

  // POST /api/auth/login
  router.post("/api/auth/login", async (request: Request) => {
    const env = getEnv()
    try {
      // Rate limit login attempts by IP
      if (env.RATE_LIMITER) {
        const ip = request.headers.get("CF-Connecting-IP") || "unknown"
        const { success } = await env.RATE_LIMITER.limit({ key: `login:${ip}` })
        if (!success) return new Response(
          JSON.stringify({ error: "Too many login attempts. Please wait before trying again." }),
          { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
        )
      }
      const { email: rawEmail, password } = await request.json() as any
      const email = typeof rawEmail === "string" ? rawEmail.toLowerCase().trim() : ""
      const user = await env.DB.prepare("SELECT id, email, password_hash, tier, role FROM users WHERE email = ?").bind(email).first() as any
      if (!user) return jsonResponse({ error: "Invalid credentials" }, 401)

      const valid = await verifyPassword(password, user.password_hash)
      if (!valid) return jsonResponse({ error: "Invalid credentials" }, 401)

      const token = generateSessionToken()
      const now = Date.now()
      await env.DB.prepare("INSERT INTO sessions (token, user_id, expires_at, expires, created_at) VALUES (?, ?, ?, ?, ?)")
        .bind(token, user.id, now + SESSION_TTL * 1000, now + SESSION_TTL * 1000, now)
        .run()

      const loginHeaders = new Headers()
      loginHeaders.append("Set-Cookie", sessionCookie(token, 7 * 24 * 60 * 60, env.COOKIE_DOMAIN))
      loginHeaders.append("Set-Cookie", tierCookie(user.tier || "free", 7 * 24 * 60 * 60))
      loginHeaders.append("Set-Cookie", roleCookie(user.role || "user", 7 * 24 * 60 * 60))
      loginHeaders.set("Content-Type", "application/json")
      return new Response(JSON.stringify({ success: true, token }), { status: 200, headers: loginHeaders })
    } catch (e: any) {
      logSafetyEvent({ level: "error", event: "auth_login_failed", request, error_type: "auth", error: e })
      return jsonResponse({ error: "Login failed" }, 500)
    }
  })

  

  // GET /api/admin/me
  router.get("/api/admin/me", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)
    if (user.role !== "owner") return jsonResponse({ error: "Forbidden" }, 403)
    return jsonResponse({ id: user.id, email: user.email, tier: user.tier, role: user.role })
  })

    // POST /api/ambassador/promo-codes
  router.post("/api/ambassador/promo-codes", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)
    if (user.role !== "ambassador" && user.role !== "owner") {
      logSafetyEvent({
        level: "warn",
        event: "ambassador_access_blocked",
        request,
        error_type: "auth",
        details: { role: user.role },
      });
      return jsonResponse({ error: "Forbidden" }, 403)
    }

    const body = await request.json().catch((error) => {
      logSafetyEvent({
        level: "warn",
        event: "promo_code_create_invalid_json",
        request,
        error_type: "validation",
        error,
      })
      return {}
    }) as any
    let discount_percent = typeof body.discount_percent === "number" ? body.discount_percent : 0
    let max_uses = typeof body.max_uses === "number" ? body.max_uses : 10

    if (user.role === "ambassador" && discount_percent > 50) {
      discount_percent = 50
    }

    const code = generatePromoCode(8)
    const id = crypto.randomUUID()
    
    await env.DB.prepare("INSERT INTO promo_codes (id, code, created_by, discount_percent, applicable_tiers, max_uses, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(id, code, user.id, discount_percent, '["pro"]', max_uses, Date.now())
      .run()

    return jsonResponse({ code })
  })

  // POST /api/promo/redeem
  router.post("/api/promo/redeem", async (request: Request) => {
    const env = getEnv()
    const body = await request.json().catch((error) => {
      logSafetyEvent({
        level: "warn",
        event: "promo_redeem_invalid_json",
        request,
        error_type: "validation",
        error,
      })
      return {}
    }) as any
    const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : ""
    if (!code) return jsonResponse({ error: "Missing code" }, 400)

    const promo = await env.DB.prepare("SELECT * FROM promo_codes WHERE code = ? AND active = 1").bind(code).first() as any
    if (!promo) return jsonResponse({ error: "Invalid or inactive promo code" }, 400)
    
    if (promo.max_uses !== null && promo.use_count >= promo.max_uses) {
      return jsonResponse({ error: "Promo code limit reached" }, 400)
    }

    const result = await env.DB.prepare("UPDATE promo_codes SET use_count = COALESCE(use_count, 0) + 1 WHERE id = ? AND (max_uses IS NULL OR COALESCE(use_count, 0) < max_uses)").bind(promo.id).run()
    if (result.meta.changes === 0) {
      return jsonResponse({ error: "Promo code limit reached" }, 400)
    }

    return jsonResponse({ 
      success: true, 
      code: promo.code,
      discount_percent: promo.discount_percent,
      applicable_tiers: promo.applicable_tiers ? JSON.parse(promo.applicable_tiers) : null
    })
  })

  // GET /api/auth/session
  router.get("/api/auth/session", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ authenticated: false })
    return jsonResponse({ authenticated: true, user })
  })

  // GET /api/auth/tier
  router.get("/api/auth/tier", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ tier: "free", subscription_status: "free" })
    return jsonResponse({ tier: user.tier, subscription_status: user.subscription_status })
  })

  // GET /api/auth/subscription — detailed subscription status for payment gating
  router.get("/api/auth/subscription", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)
    return jsonResponse({
      tier: user.tier,
      subscription_status: user.subscription_status,
      has_active_subscription: user.subscription_status === "active" || user.tier === "pro",
    })
  })

  // POST /api/auth/change-password
  router.post("/api/auth/change-password", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)

    try {
      const { currentPassword, newPassword } = await request.json() as { currentPassword?: string; newPassword?: string }
      if (!currentPassword || !newPassword) return jsonResponse({ error: "Missing fields" }, 400)
      if (newPassword.length < 8) return jsonResponse({ error: "New password must be at least 8 characters" }, 400)

      // Verify current password
      const dbUser = await env.DB.prepare("SELECT password_hash FROM users WHERE id = ?")
        .bind(user.id).first()
      if (!dbUser) return jsonResponse({ error: "User not found" }, 404)

      const valid = await verifyPassword(currentPassword, dbUser.password_hash)
      if (!valid) return jsonResponse({ error: "Current password is incorrect" }, 401)

      // Hash and update new password
      const newHash = await hashPassword(newPassword)
      await env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?")
        .bind(newHash, user.id).run()

      // Invalidate all other sessions for security
      await writeAuditLog(env.DB, {
        actorId: user.id,
        actorEmail: user.email,
        action: "password_changed",
        ip: request.headers.get("CF-Connecting-IP") ?? undefined,
      });
      const currentToken = getSessionToken(request) ?? ""
      await env.DB.prepare("DELETE FROM sessions WHERE user_id = ? AND token != ?")
        .bind(user.id, currentToken).run()

      return jsonResponse({ success: true })
    } catch (e) {
      logSafetyEvent({ level: "error", event: "auth_change_password_failed", request, error_type: "auth", error: e })
      return jsonResponse({ error: "Failed to change password" }, 500)
    }
  })

  // GET /api/auth/export — export all user data (GDPR compliance)
  router.get("/api/auth/export", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)

    try {
      // Collect all user data
      const [library, interactions, people, natal] = await Promise.all([
        env.DB.prepare("SELECT id, title, workspace_source, created_at FROM library WHERE user_id = ?")
          .bind(user.id).all(),
        env.DB.prepare("SELECT id, mode, question, confidence, created_at FROM interactions WHERE session_id IN (SELECT token FROM sessions WHERE user_id = ?)")
          .bind(user.id).all(),
        env.DB.prepare("SELECT id, name, relation, created_at FROM people WHERE user_id = ?")
          .bind(user.id).all(),
        env.KV.get(`natal:${user.id}`),
      ])

      const exportData = {
        exportedAt: new Date().toISOString(),
        account: { id: user.id, email: user.email, tier: user.tier, createdAt: (user as any).created_at },
        library: library.results || [],
        interactions: interactions.results || [],
        people: people.results || [],
        baselineDesign: natal ? JSON.parse(natal) : null,
      }

      return new Response(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="sovereign-os-export-${user.id.slice(0, 8)}.json"`,
        },
      })
    } catch (e) {
      logSafetyEvent({ level: "error", event: "auth_export_failed", request, error_type: "auth", error: e })
      return jsonResponse({ error: "Failed to export data" }, 500)
    }
  })

  // DELETE /api/auth/account — permanently delete user account and all data
  router.delete("/api/auth/account", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)

    try {
      // Delete all user data in order (FK constraints)
      await env.DB.batch([
        env.DB.prepare("DELETE FROM interactions WHERE session_id IN (SELECT token FROM sessions WHERE user_id = ?)").bind(user.id),
        env.DB.prepare("DELETE FROM patterns WHERE session_id IN (SELECT token FROM sessions WHERE user_id = ?)").bind(user.id),
        env.DB.prepare("DELETE FROM library WHERE user_id = ?").bind(user.id),
        env.DB.prepare("DELETE FROM people WHERE user_id = ?").bind(user.id),
        env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user.id),
        env.DB.prepare("DELETE FROM users WHERE id = ?").bind(user.id),
      ])

      // Clear KV data
      await env.KV.delete(`natal:${user.id}`).catch((error) => {
        logSafetyEvent({
          level: "warn",
          event: "auth_delete_account_natal_cleanup_failed",
          request,
          error_type: "auth",
          error,
          details: { userId: user.id },
        })
      })
      await env.KV.delete(`baseline:${user.id}`).catch((error) => {
        logSafetyEvent({
          level: "warn",
          event: "auth_delete_account_baseline_cleanup_failed",
          request,
          error_type: "auth",
          error,
          details: { userId: user.id },
        })
      })

      const cookieDomain = env.COOKIE_DOMAIN || undefined
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": clearCookie(cookieDomain),
          ...getCorsHeaders(request),
        },
      })
    } catch (e) {
      logSafetyEvent({ level: "error", event: "auth_delete_account_failed", request, error_type: "auth", error: e })
      return jsonResponse({ error: "Failed to delete account" }, 500)
    }
  })

  // DELETE /api/auth/sessions/:token — revoke a specific session
  router.delete("/api/auth/sessions/:token", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)

    const url = new URL(request.url)
    const tokenSuffix = url.pathname.split('/').pop()
    if (!tokenSuffix) return jsonResponse({ error: "Missing token" }, 400)

    try {
      // Find and delete session by last 6 chars of token (masked ID)
      // This prevents exposing full tokens while still allowing revocation
      const { results } = await env.DB.prepare(
        "SELECT token FROM sessions WHERE user_id = ? AND expires_at > ?"
      ).bind(user.id, Date.now()).all()

      const session = (results || []).find((s: any) => 
        String(s.token).slice(-6) === tokenSuffix
      )

      if (!session) return jsonResponse({ error: "Session not found" }, 404)

      await env.DB.prepare("DELETE FROM sessions WHERE token = ? AND user_id = ?")
        .bind((session as any).token, user.id).run()

      return jsonResponse({ success: true })
    } catch (e) {
      return jsonResponse({ error: "Failed to revoke session" }, 500)
    }
  })

  // GET /api/auth/sessions — list active sessions for current user
  router.get("/api/auth/sessions", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)

    try {
      const queryResult = await env.DB.prepare(
        "SELECT token, created_at, expires_at FROM sessions WHERE user_id = ? AND expires_at > ? ORDER BY created_at DESC LIMIT 10"
      ).bind(user.id, Date.now()).all()

      const results = ((queryResult as { results?: unknown[] })?.results ?? []) as Array<{
        token: string
        created_at: number
        expires_at: number
      }>

      // Mask tokens for security — only show last 6 chars
      const sessions = (results || []).map(s => ({
        id: s.token.slice(-6),
        createdAt: new Date(s.created_at).toISOString(),
        expiresAt: new Date(s.expires_at).toISOString(),
      }))

      return jsonResponse({ sessions })
    } catch (e) {
      logSafetyEvent({ level: "error", event: "auth_sessions_fetch_failed", request, error_type: "auth", error: e })
      return jsonResponse({ error: "Failed to fetch sessions" }, 500)
    }
  })

  // POST /api/auth/refresh — extend session by 7 days if still valid
  router.post("/api/auth/refresh", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)

    try {
      // Generate new session token
      const newToken = generateSessionToken()
      const now = Date.now()
      const SESSION_TTL = 7 * 24 * 60 * 60 // 7 days in seconds
      const cookieDomain = env.COOKIE_DOMAIN || undefined

      // Get old token from cookie
      const oldToken = getSessionToken(request)

      // Insert new session
      await env.DB.prepare("INSERT INTO sessions (token, user_id, expires_at, expires, created_at) VALUES (?, ?, ?, ?, ?)")
        .bind(newToken, user.id, now + SESSION_TTL * 1000, now + SESSION_TTL * 1000, now).run()

      // Delete old session
      if (oldToken) {
        await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(oldToken).run()
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": sessionCookie(newToken, SESSION_TTL, cookieDomain),
        },
      })
    } catch (e) {
      logSafetyEvent({ level: "error", event: "auth_refresh_failed", request, error_type: "auth", error: e })
      return jsonResponse({ error: "Failed to refresh session" }, 500)
    }
  })

  // POST /api/auth/logout
  router.post("/api/auth/logout", async (request: Request) => {
    const env = getEnv()
    const cookieDomain = env.COOKIE_DOMAIN || undefined
    // Clean up expired sessions opportunistically on logout
    try {
      await env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?")
        .bind(Date.now()).run()
    } catch (error) {
      logSafetyEvent({ level: "warn", event: "auth_logout_cleanup_failed", request, error_type: "auth", error })
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": clearCookie(cookieDomain),
        ...getCorsHeaders(request),
      },
    })
  })

  // GET /api/people — list people for current user
  router.get("/api/people", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)

    const people = await env.DB.prepare("SELECT * FROM people WHERE user_id = ?").bind(user.id).all()
    return jsonResponse({ people: people.results ?? [] })
  })

  // POST /api/people — add a person
  router.post("/api/people", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)
    try {
      const { name, relation } = await request.json() as { name?: string; relation?: string }
      if (!name || typeof name !== "string" || !name.trim()) {
        return jsonResponse({ error: "Name is required" }, 400)
      }
      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      await env.DB.prepare(
        "INSERT INTO people (id, user_id, name, created_at) VALUES (?, ?, ?, ?)"
      ).bind(id, user.id, name.trim(), now).run()
      // Update relation if provided (column added in migration 0018)
      if (relation?.trim()) {
        await env.DB.prepare("UPDATE people SET relation = ? WHERE id = ?")
          .bind(relation.trim(), id).run().catch((error) => {
            logSafetyEvent({
              level: "warn",
              event: "people_relation_update_failed",
              request,
              error_type: "system",
              error,
              details: { personId: id },
            })
          })
      }
      return jsonResponse({ success: true, id, name: name.trim() })
    } catch (e) {
      logSafetyEvent({ level: "error", event: "people_create_failed", request, error_type: "system", error: e })
      return jsonResponse({ error: "Failed to create person" }, 500)
    }
  })

  // DELETE /api/people/:id — remove a person
  router.delete("/api/people/:id", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    if (!id) return jsonResponse({ error: "Missing ID" }, 400)
    try {
      await env.DB.prepare("DELETE FROM people WHERE id = ? AND user_id = ?")
        .bind(id, user.id).run()
      return jsonResponse({ success: true })
    } catch (e) {
      logSafetyEvent({ level: "error", event: "people_delete_failed", request, error_type: "system", error: e, details: { personId: id } })
      return jsonResponse({ error: "Failed to delete person" }, 500)
    }
  })

  // GET /api/user/me — current user profile
  router.get("/api/user/me", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)
    const row = await env.DB.prepare("SELECT email_verified, email_notifications FROM users WHERE id = ?").bind(user.id).first() as any
    return jsonResponse({
      id: user.id,
      email: user.email,
      tier: user.tier || "free",
      role: user.role || "user",
      subscription_status: user.subscription_status || "free",
      email_verified: row?.email_verified === 1,
      email_notifications: row?.email_notifications !== 0,
    })
  })

  // GET /api/user/usage — session quota for current user
  router.get("/api/user/usage", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)

    const isPro = user.tier === "pro" || user.subscription_status === "active"
    if (isPro) {
      const today = new Date().toISOString().slice(0, 10)
      const key = `pro-usage:${user.id}:${today}`
      const raw = await env.KV.get(key)
      const used = raw ? parseInt(raw, 10) : 0
      const limit = parseInt(env.PRO_DAILY_LIMIT || "200", 10)
      return jsonResponse({ tier: "pro", used, limit, remaining: Math.max(0, limit - used) })
    }

    // Free tier — keyed by session id
    const sid = await getSessionId(request)
    const today = new Date().toISOString().slice(0, 10)
    const key = `usage:${sid}:${today}`
    const raw = await env.KV.get(key)
    const used = raw ? parseInt(raw, 10) : 0
    const baseLimit = parseInt(env.FREE_DAILY_LIMIT || "5", 10)
    // Add bonus sessions from referral incentive
    const bonusRaw = await env.KV.get(`bonus_sessions:${user.id}`)
    const bonusSessions = bonusRaw ? parseInt(bonusRaw, 10) : 0
    const limit = baseLimit + bonusSessions
    return jsonResponse({ tier: "free", used, limit, remaining: Math.max(0, limit - used), bonus: bonusSessions })
  })

  // ── Admin audit log viewer ──────────────────────────────────────────────
  router.get("/api/admin/audit-log", async (request: Request) => {
    const env = getEnv();
    const user = await getAuthUser(request, env.DB);
    if (!user || user.role !== "admin") return jsonResponse({ error: "Forbidden" }, 403);
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const rows = await env.DB.prepare(
      "SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).bind(limit, offset).all();
    return jsonResponse({ logs: rows.results, limit, offset });
  });

  // ── Admin stats endpoint ─────────────────────────────────────────────────
  router.get("/api/admin/stats", async (request: Request) => {
    const env = getEnv();
    const user = await getAuthUser(request, env.DB);
    if (!user || user.role !== "admin") return jsonResponse({ error: "Forbidden" }, 403);
    const [userCount, proCount, sessionCount, libraryCount] = await Promise.all([
      env.DB.prepare("SELECT COUNT(*) as n FROM users").first().then((row) => row as { n: number } | null),
      env.DB.prepare("SELECT COUNT(*) as n FROM users WHERE tier = 'pro'").first().then((row) => row as { n: number } | null),
      env.DB.prepare("SELECT COUNT(*) as n FROM sessions WHERE expires_at > ?").bind(Date.now()).first().then((row) => row as { n: number } | null),
      env.DB.prepare("SELECT COUNT(*) as n FROM library").first().then((row) => row as { n: number } | null).catch(() => ({ n: 0 })),
    ]);
    return jsonResponse({
      users: { total: userCount?.n ?? 0, pro: proCount?.n ?? 0 },
      sessions: { active: sessionCount?.n ?? 0 },
      library: { items: libraryCount?.n ?? 0 },
      timestamp: new Date().toISOString(),
    });
  });

  // ── Email notification preferences ──────────────────────────────────────
  router.post("/api/auth/notifications", async (request: Request) => {
    const env = getEnv();
    const user = await getAuthUser(request, env.DB);
    if (!user) return jsonResponse({ error: "unauthorized" }, 401);
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const enabled = body.enabled !== false ? 1 : 0;
    await env.DB.prepare("UPDATE users SET email_notifications = ? WHERE id = ?")
      .bind(enabled, user.id).run();
    return jsonResponse({ ok: true, email_notifications: enabled === 1 });
  });

  // ── One-click unsubscribe (GET link from email footer) ───────────────────
  router.get("/api/auth/unsubscribe", async (request: Request) => {
    const env = getEnv();
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    if (!token) return new Response("Invalid link", { status: 400 });
    try {
      const decoded = atob(token);
      const [, userId] = decoded.split(":");
      if (!userId) return new Response("Invalid link", { status: 400 });
      await env.DB.prepare("UPDATE users SET email_notifications = 0 WHERE id = ?")
        .bind(userId).run();
      return new Response(
        `<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#08070a;color:#f4efe9;">
          <h2>Unsubscribed</h2>
          <p style="color:#a8a29a;">You've been removed from marketing emails. Transactional emails (password reset, billing) will still be sent.</p>
          <a href="https://app.defrag.app/settings" style="color:#e0743a;">Manage preferences</a>
        </body></html>`,
        { headers: { "content-type": "text/html" } }
      );
    } catch {
      return new Response("Invalid link", { status: 400 });
    }
  });

}

// POST /api/auth/admin-seed — standalone route registration
// Called separately from registerAuthRoutes to avoid placement issues

export function registerAdminSeedRoute(router: any, getEnv: () => any) {
  router.post("/api/auth/admin-seed", async (request: Request) => {
    const env = getEnv()
    try {
      const { secret, email, password } = await request.json() as any
      if (!env.ADMIN_SEED_SECRET) return new Response(JSON.stringify({ error: "Not configured" }), { status: 403, headers: { "Content-Type": "application/json" } })
      if (secret !== env.ADMIN_SEED_SECRET) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } })
      if (!email || !password) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: { "Content-Type": "application/json" } })
      if (password.length < 8) return new Response(JSON.stringify({ error: "Password too short" }), { status: 400, headers: { "Content-Type": "application/json" } })
      const normalizedEmail = email.toLowerCase().trim()
      const password_hash = await hashPassword(password)
      const now = Date.now()
      const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
        .bind(normalizedEmail)
        .first() as { id: string } | null
      if (existing) {
        await env.DB.prepare("UPDATE users SET password_hash = ?, role = 'owner' WHERE id = ?")
          .bind(password_hash, existing.id).run()
        await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?")
          .bind(existing.id).run()
        return new Response(JSON.stringify({ success: true, action: "updated", email: normalizedEmail }), { headers: { "Content-Type": "application/json" } })
      } else {
        const userId = crypto.randomUUID()
        await env.DB.prepare(
          "INSERT INTO users (id, email, password_hash, created_at, role) VALUES (?, ?, ?, ?, 'owner')"
        ).bind(userId, normalizedEmail, password_hash, now).run()
        return new Response(JSON.stringify({ success: true, action: "created", email: normalizedEmail }), { headers: { "Content-Type": "application/json" } })
      }
    } catch (err) {
      console.error("[auth] Admin seed:", err)
      return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { "Content-Type": "application/json" } })
    }
  })
}


/**
 * Decodes a JWT token without verification.
 * @param token The JWT token string.
 * @returns The decoded header and payload, or null if parsing fails.
 */
function decodeJwt(token: string): { header: any; payload: any } | null {
  try {
    const [headerB64, payloadB64] = token.split('.');
    if (!headerB64 || !payloadB64) return null;
    const headerStr = atob(headerB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payloadStr = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    return {
      header: JSON.parse(headerStr),
      payload: JSON.parse(payloadStr),
    };
  } catch (error) {
    logSafetyEvent({
      level: "warn",
      event: "jwt_decode_failed",
      endpoint: "auth",
      requestId: "internal",
      reason: "unknown_failure",
      error,
    })
    return null;
  }
}

/**
 * Verifies a Cloudflare Access JWT.
 * This function checks the token's signature against Cloudflare's public keys
 * and validates the issuer and audience claims.
 *
 * @param request The incoming request.
 * @param env The worker environment, containing TEAM_DOMAIN and POLICY_AUD.
 * @returns A Response object if validation fails, otherwise null.
 */
export async function verifyAccessJWT(request: Request, env: { TEAM_DOMAIN?: string; POLICY_AUD?: string; }) {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) {
    return jsonResponse({ error: "Unauthorized: Missing Cloudflare Access JWT." }, 401);
  }

  try {
    const decoded = decodeJwt(token);
    if (!decoded) {
      return jsonResponse({ error: "Invalid JWT format" }, 401);
    }

    const { header, payload } = decoded;
    const teamDomain = env.TEAM_DOMAIN;
    if (!teamDomain || payload.iss !== teamDomain) {
      return jsonResponse({ error: "Invalid JWT issuer" }, 401);
    }

    const aud = env.POLICY_AUD;
    if (!aud || (Array.isArray(payload.aud) ? !payload.aud.includes(aud) : payload.aud !== aud)) {
      return jsonResponse({ error: "Invalid JWT audience" }, 401);
    }

    const certsUrl = `${teamDomain}/cdn-cgi/access/certs`;
    const { keys } = await fetch(certsUrl).then(res => res.json() as Promise<{keys: any[]}>);
    const jwk = keys.find(key => key.kid === header.kid);
    if (!jwk) {
      return jsonResponse({ error: "Matching key not found for JWT" }, 401);
    }

    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RS256", hash: "SHA-256" }, false, ["verify"]);
    const [headerB64, payloadB64, signatureB64 = ""] = token.split('.');
    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const isValid = await crypto.subtle.verify({ name: "RS256" }, key, signature, data);

    if (!isValid) {
      return jsonResponse({ error: "Invalid JWT signature" }, 401);
    }

    return null; // Token is valid
  } catch (err: any) {
    logSafetyEvent({ level: "error", event: "auth_jwt_verification_failed", request, error_type: "auth", error: err });
    return jsonResponse({ error: "JWT verification failed" }, 500);
  }
}

// Turnstile bot verification
export async function verifyTurnstile(token: string, secretKey: string, request?: Request): Promise<boolean> {
  if (!token) return false;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: secretKey, response: token }),
    });
    const data = await response.json() as { success: boolean };
    return data.success;
  } catch (error) {
    logSafetyEvent({
      level: "warn",
      event: "turnstile_verification_failed",
      request,
      error_type: "auth",
      error,
    });
    return false;
  }

}