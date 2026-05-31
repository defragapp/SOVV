// Password hashing - PBKDF2 with SHA-512 via Web Crypto API
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

  const actualHash = new Uint8Array(await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-512" },
    keyMaterial,
    KEY_LENGTH * 8
  ))

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
    "SameSite=Lax",
  ].join("; ")
}

export function clearCookie(): string {
  return "__sov_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax"
}

export function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get("Cookie")
  if (!cookie) return null
  const match = cookie.match(/__sov_session=([^;]+)/)
  return match ? match[1] : null
}

export function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  })
}

export async function getAuthUser(request: Request, DB: D1Database): Promise<{ id: string; email: string; tier: string; stripe_customer_id: string | null } | null> {
  const token = getSessionToken(request)
  if (!token) return null

  const session = await DB.prepare(
    "SELECT u.id, u.email, u.tier, u.stripe_customer_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?"
  )
    .bind(token, Date.now())
    .first<{ id: string; email: string; tier: string; stripe_customer_id: string | null }>()

  return session || null
}

const SESSION_TTL = 7 * 24 * 60 * 60

export function registerAuthRoutes(router: any, getEnv: () => any) {
  // POST /api/auth/register
  router.post("/api/auth/register", async (request: Request) => {
    const env = getEnv()
    const { email, password } = await request.json() as any
    if (!email || !password) return jsonResponse({ error: "Missing fields" }, 400)

    try {
      const password_hash = await hashPassword(password)
      const userId = crypto.randomUUID()
      await env.DB.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)")
        .bind(userId, email, password_hash)
        .run()

      const token = generateSessionToken()
      await env.DB.prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)")
        .bind(userId, token, Date.now() + SESSION_TTL * 1000)
        .run()

      return jsonResponse({ success: true }, 200, {
        "Set-Cookie": sessionCookie(token),
      })
    } catch (e: any) {
      if (e.message.includes("UNIQUE")) return jsonResponse({ error: "Email exists" }, 400)
      return jsonResponse({ error: "Registration failed" }, 500)
    }
  })

  // POST /api/auth/login
  router.post("/api/auth/login", async (request: Request) => {
    const env = getEnv()
    const { email, password } = await request.json() as any
    const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first() as any
    if (!user) return jsonResponse({ error: "Invalid credentials" }, 401)

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) return jsonResponse({ error: "Invalid credentials" }, 401)

    const token = generateSessionToken()
    await env.DB.prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)")
      .bind(user.id, token, Date.now() + SESSION_TTL * 1000)
      .run()

    return jsonResponse({ success: true }, 200, {
      "Set-Cookie": sessionCookie(token),
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
    if (!user) return jsonResponse({ tier: "free" })
    return jsonResponse({ tier: user.tier })
  })

  // POST /api/auth/logout
  router.post("/api/auth/logout", async (request: Request) => {
    const env = getEnv()
    const token = getSessionToken(request)
    if (token) {
      await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run()
    }
    return jsonResponse({ success: true }, 200, {
      "Set-Cookie": clearCookie(),
    })
  })

  // GET /api/auth/people
  router.get("/api/auth/people", async (request: Request) => {
    const env = getEnv()
    const user = await getAuthUser(request, env.DB)
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401)

    const people = await env.DB.prepare("SELECT * FROM people WHERE user_id = ?").bind(user.id).all()
    return jsonResponse(people.results)
  })
}

export async function verifyAccessJWT(request: Request, env: any) {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  return null;
}
