// Password hashing — PBKDF2 with SHA-512 via Web Crypto API
const PBKDF2_ITERATIONS = 600_000
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
  const [iterStr, saltB64, hashB64] = stored.split(":")
  const iterations = parseInt(iterStr, 10)
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

  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-512" },
    keyMaterial,
    KEY_LENGTH * 8
  )

  const actualHash = new Uint8Array(derivedBits)
  if (actualHash.length !== expectedHash.length) return false
  let diff = 0
  for (let i = 0; i < actualHash.length; i++) {
    diff |= actualHash[i] ^ expectedHash[i]
  }
  return diff === 0
}

export function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(48))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

export function sessionCookie(token: string, maxAge = 7 * 24 * 60 * 60): string {
  return [
    `__sov_session=${token}`,
    `Max-Age=${maxAge}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
  ].join("; ")
}

export function clearCookie(): string {
  return [
    "__sov_session=",
    "Max-Age=0",
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
  ].join("; ")
}

export function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get("Cookie") ?? ""
  const match = cookie.match(/__sov_session=([a-f0-9]+)/)
  return match ? match[1] : null
}

export function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  })
}

export async function getAuthUser(request: Request, DB: D1Database): Promise<{
  id: string; email: string; tier: string; stripe_customer_id: string | null
} | null> {
  const token = getSessionToken(request)
  if (!token) return null

  const session = await DB.prepare(
    "SELECT user_id, expires FROM sessions WHERE token = ?"
  ).bind(token).first()

  if (!session || (session.expires as number) < Date.now()) return null

  const user = await DB.prepare(
    "SELECT id, email, tier, stripe_customer_id FROM users WHERE id = ?"
  ).bind(session.user_id).first()

  return user as any
}

const SESSION_TTL = 7 * 24 * 60 * 60

export function registerAuthRoutes(router: any, getEnv: () => any) {
  // POST /api/auth/register
  router.post("/api/auth/register", async (request: Request) => {
    const { DB, KV } = getEnv()
    const body = await request.json() as { email?: string; password?: string }
    const { email, password } = body

    if (!email || !password || password.length < 8) {
      return jsonResponse({ error: "Invalid input" }, 400)
    }

    const userId = `usr_${crypto.randomUUID().replace(/-/g, "")}`
    const passwordHash = await hashPassword(password)
    const token = generateSessionToken()
    const now = Date.now()

    try {
      await DB.prepare(
        "INSERT INTO users (id, email, password_hash, tier, created_at) VALUES (?, ?, ?, 'free', ?)"
      ).bind(userId, email.toLowerCase(), passwordHash, now).run()
    } catch (e: any) {
      if (e.message?.includes("UNIQUE constraint")) {
        return jsonResponse({ error: "Account already exists" }, 409)
      }
      throw e
    }

    await DB.prepare(
      "INSERT INTO sessions (token, user_id, expires, created_at) VALUES (?, ?, ?, ?)"
    ).bind(token, userId, now + SESSION_TTL * 1000, now).run()

    await KV.put(`session:${token}`, JSON.stringify({
      user_id: userId, email, expires: now + SESSION_TTL * 1000
    }), { expirationTtl: SESSION_TTL })

    await DB.prepare(
      "INSERT INTO people (id, user_id, name, relation, created_at) VALUES (?, ?, 'You', 'self', ?)"
    ).bind(`self_${userId}`, userId, now).run()

    return jsonResponse({ user: { id: userId, email } }, 200, {
      "Set-Cookie": sessionCookie(token),
    })
  })

  // POST /api/auth/login
  router.post("/api/auth/login", async (request: Request) => {
    const { DB, KV } = getEnv()
    const body = await request.json() as { email?: string; password?: string }
    const { email, password } = body

    if (!email || !password) {
      return jsonResponse({ error: "Invalid input" }, 400)
    }

    const user = await DB.prepare(
      "SELECT id, email, password_hash, tier FROM users WHERE email = ?"
    ).bind(email.toLowerCase()).first() as any

    if (!user) {
      return jsonResponse({ error: "Invalid credentials" }, 401)
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return jsonResponse({ error: "Invalid credentials" }, 401)
    }

    const token = generateSessionToken()
    const now = Date.now()
    const expires = now + SESSION_TTL * 1000

    await DB.prepare(
      "INSERT INTO sessions (token, user_id, expires, created_at) VALUES (?, ?, ?, ?)"
    ).bind(token, user.id, expires, now).run()

    await KV.put(`session:${token}`, JSON.stringify({
      user_id: user.id, email: user.email, expires
    }), { expirationTtl: SESSION_TTL })

    return jsonResponse({ user: { id: user.id, email: user.email } }, 200, {
      "Set-Cookie": sessionCookie(token),
    })
  })

  // GET /api/auth/session
  router.get("/api/auth/session", async (request: Request) => {
    const { DB, KV } = getEnv()
    const token = getSessionToken(request)
    if (!token) return jsonResponse({ user: null }, 401)

    const cached = await KV.get(`session:${token}`, "json") as any
    if (cached && cached.expires > Date.now()) {
      return jsonResponse({ user: { id: cached.user_id, email: cached.email } })
    }

    const session = await DB.prepare(
      "SELECT s.user_id, s.expires, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ?"
    ).bind(token).first() as any

    if (!session || session.expires < Date.now()) {
      return jsonResponse({ user: null }, 401, { "Set-Cookie": clearCookie() })
    }

    return jsonResponse({ user: { id: session.user_id, email: session.email } })
  })

  // GET /api/auth/tier
  router.get("/api/auth/tier", async (request: Request) => {
    const { DB } = getEnv()
    const user = await getAuthUser(request, DB)
    if (!user) return jsonResponse({ tier: "free" }, 401)

    return jsonResponse({ tier: user.tier || "free" })
  })

  // POST /api/auth/logout
  router.post("/api/auth/logout", async (request: Request) => {
    const { DB, KV } = getEnv()
    const token = getSessionToken(request)
    if (token) {
      await Promise.all([
        KV.delete(`session:${token}`),
        DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run(),
      ])
    }
    return jsonResponse({ ok: true }, 200, { "Set-Cookie": clearCookie() })
  })

  // GET /api/auth/people
  router.get("/api/auth/people", async (request: Request) => {
    const { DB } = getEnv()
    const user = await getAuthUser(request, DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)

    const people = await DB.prepare(
      "SELECT id, name, relation FROM people WHERE user_id = ? ORDER BY created_at ASC"
    ).bind(user.id).all()

    return jsonResponse({ people: people.results })
  })
}
