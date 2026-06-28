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
  } catch {
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
"Domain=.defrag.app",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ")
}

export function clearCookie(): string {
  return "__sov_session=; Max-Age=0; Path=/; Domain=.defrag.app; HttpOnly; Secure; SameSite=Lax"
}


export function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get("Cookie")
  if (!cookie) return null
  const match = cookie.match(/__sov_session=([^;]+)/)
  return match ? (match[1] ?? null) : null
}

import type { D1Database } from "@cloudflare/workers-types";
import { getSessionId } from "./plan.js";

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
    "SELECT u.id, u.email, u.tier, u.role, u.stripe_customer_id, COALESCE(u.subscription_status, 'free') as subscription_status FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires > ?"
  )
    .bind(token, Date.now())
    .first<{ id: string; email: string; tier: string; role: string; stripe_customer_id: string | null; subscription_status: string }>()

  if (!session) return null
  return { ...session, role: session.role || "user", subscription_status: session.subscription_status || "free" }
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
        if (!success) return jsonResponse({ error: "Too many registration attempts. Please wait before trying again." }, 429)
      }
      const { email: rawRegEmail, password, turnstileToken } = await request.json() as any
      const email = typeof rawRegEmail === "string" ? rawRegEmail.toLowerCase().trim() : ""
      if (!email || !password) return jsonResponse({ error: "Missing fields" }, 400)
      if (typeof password === "string" && password.length < 8) return jsonResponse({ error: "Password must be at least 8 characters" }, 400)
      if (typeof email === "string" && !email.includes("@")) return jsonResponse({ error: "Invalid email address" }, 400)

      if (env.TURNSTILE_SECRET_KEY) {
        const isHuman = await verifyTurnstile(String(turnstileToken ?? ""), env.TURNSTILE_SECRET_KEY)
        if (!isHuman) return jsonResponse({ error: "Bot verification failed" }, 403)
      } else {
        console.warn("Turnstile secret key missing — bypassing bot verification.")
      }

      const password_hash = await hashPassword(password)
      const userId = crypto.randomUUID()
      const now = Date.now()

      await env.DB.prepare("INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)")
        .bind(userId, email, password_hash, now)
        .run()

      const token = generateSessionToken()
      await env.DB.prepare("INSERT INTO sessions (token, user_id, expires, created_at) VALUES (?, ?, ?, ?)")
        .bind(token, userId, now + SESSION_TTL * 1000, now)
        .run()

      // Send welcome email via queue (non-blocking)
      if (env.QUEUE) {
        void env.QUEUE.send({ type: "welcome", to: email }).catch((err: unknown) =>
          console.warn("[auth] Failed to queue welcome email:", err)
        )
      } else if (env.RESEND_API_KEY) {
        // Fallback: send directly if no queue
        const { sendWelcomeEmail } = await import("./email.js")
        void sendWelcomeEmail(email, { resendApiKey: env.RESEND_API_KEY }).catch((err: unknown) =>
          console.warn("[auth] Failed to send welcome email:", err)
        )
      }

      return jsonResponse({ success: true, token }, 200, {
        "Set-Cookie": sessionCookie(token, 7 * 24 * 60 * 60, env.COOKIE_DOMAIN),
      })
    } catch (e: any) {
      if (e?.message?.includes("UNIQUE")) return jsonResponse({ error: "Email exists" }, 400)
      console.error("Registration failed", e)
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
        if (!success) return jsonResponse({ error: "Too many login attempts. Please wait before trying again." }, 429)
      }
      const { email: rawEmail, password } = await request.json() as any
      const email = typeof rawEmail === "string" ? rawEmail.toLowerCase().trim() : ""
      const user = await env.DB.prepare("SELECT id, email, password_hash, tier, role FROM users WHERE email = ?").bind(email).first() as any
      if (!user) return jsonResponse({ error: "Invalid credentials" }, 401)

      const valid = await verifyPassword(password, user.password_hash)
      if (!valid) return jsonResponse({ error: "Invalid credentials" }, 401)

      const token = generateSessionToken()
      const now = Date.now()
      await env.DB.prepare("INSERT INTO sessions (token, user_id, expires, created_at) VALUES (?, ?, ?, ?)")
        .bind(token, user.id, now + SESSION_TTL * 1000, now)
        .run()

      return jsonResponse({ success: true, token }, 200, {
        "Set-Cookie": sessionCookie(token, 7 * 24 * 60 * 60, env.COOKIE_DOMAIN),
      })
    } catch (e: any) {
      console.error("Login failed", e)
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
      console.warn("Attempted ambassador access blocked for role: " + user.role);
      return jsonResponse({ error: "Forbidden" }, 403)
    }

    const body = await request.json().catch(() => ({})) as any
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
    const body = await request.json().catch(() => ({})) as any
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

  // DELETE /api/auth/account — permanently delete user account and all data
  router.delete("/api/auth/account", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)

    try {
      // Delete all user data in order (FK constraints)
      await env.DB.batch([
        env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user.id),
        env.DB.prepare("DELETE FROM library WHERE user_id = ?").bind(user.id),
        env.DB.prepare("DELETE FROM interactions WHERE session_id IN (SELECT token FROM sessions WHERE user_id = ?)").bind(user.id),
        env.DB.prepare("DELETE FROM patterns WHERE session_id IN (SELECT token FROM sessions WHERE user_id = ?)").bind(user.id),
        env.DB.prepare("DELETE FROM people WHERE user_id = ?").bind(user.id),
        env.DB.prepare("DELETE FROM users WHERE id = ?").bind(user.id),
      ])

      // Clear KV data
      await env.KV.delete(`natal:${user.id}`).catch(() => {})
      await env.KV.delete(`baseline:${user.id}`).catch(() => {})

      const cookieDomain = env.COOKIE_DOMAIN || undefined
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": clearCookie(),
          ...getCorsHeaders(request),
        },
      })
    } catch (e) {
      console.error("[DELETE_ACCOUNT]", e)
      return jsonResponse({ error: "Failed to delete account" }, 500)
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
    } catch { /* non-blocking */ }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": clearCookie(),
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
    return jsonResponse(people.results)
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
        "INSERT INTO people (id, user_id, name, relation, created_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(id, user.id, name.trim(), relation?.trim() || null, now).run()
      return jsonResponse({ success: true, id, name: name.trim() })
    } catch (e) {
      console.error("[PEOPLE_CREATE]", e)
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
      return jsonResponse({ error: "Failed to delete person" }, 500)
    }
  })

  // GET /api/user/me — current user profile
  router.get("/api/user/me", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)
    const row = await env.DB.prepare("SELECT email_verified FROM users WHERE id = ?").bind(user.id).first() as any
    return jsonResponse({
      id: user.id,
      email: user.email,
      tier: user.tier || "free",
      role: user.role || "user",
      subscription_status: user.subscription_status || "free",
      email_verified: row?.email_verified === 1,
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
    const limit = parseInt(env.FREE_DAILY_LIMIT || "5", 10)
    return jsonResponse({ tier: "free", used, limit, remaining: Math.max(0, limit - used) })
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
  } catch (e) {
    console.error("Failed to decode JWT", e);
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
    console.error("JWT Verification failed:", err.stack);
    return jsonResponse({ error: "JWT verification failed" }, 500);
  }
}

// Turnstile bot verification
export async function verifyTurnstile(token: string, secretKey: string): Promise<boolean> {
  if (!token) return false;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: secretKey, response: token }),
    });
    const data = await response.json() as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
}