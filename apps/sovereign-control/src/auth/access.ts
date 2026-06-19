import type { Env, Role } from "../types.js"

export interface AccessIdentity {
  email: string
  name?: string
  role: Role
}

/**
 * Verify Cloudflare Access JWT and extract identity.
 * Falls back to dev mode if TEAM_DOMAIN is not configured.
 */
export async function verifyAccess(
  request: Request,
  env: Env
): Promise<AccessIdentity | null> {
  // Development mode — no Access configured
  if (env.ENVIRONMENT === "development" || !env.TEAM_DOMAIN) {
    const devHeader = request.headers.get("X-Dev-Identity")
    if (devHeader) {
      return { email: devHeader, role: "admin" }
    }
    // In dev, allow unauthenticated as viewer
    return { email: "dev@localhost", role: "viewer" }
  }

  const token = request.headers.get("Cf-Access-Jwt-Assertion")
  if (!token) return null

  try {
    // Fetch Cloudflare Access public keys
    const certsUrl = `https://${env.TEAM_DOMAIN}/cdn-cgi/access/certs`
    const certsRes = await fetch(certsUrl)
    if (!certsRes.ok) return null
    const certs = await certsRes.json() as { keys: JsonWebKey[] }

    // Decode JWT header to find key ID
    const [headerB64, payloadB64, sigB64] = token.split(".")
    if (!headerB64 || !payloadB64 || !sigB64) return null

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")))

    // Verify audience
    if (env.POLICY_AUD && payload.aud !== env.POLICY_AUD) return null

    // Verify expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null

    const email = payload.email as string
    if (!email) return null

    // Role assignment — extend this with D1 lookup for production
    const role = assignRole(email)

    return { email, name: payload.name, role }
  } catch {
    return null
  }
}

/**
 * Assign role based on email.
 * In production, replace with D1 lookup.
 */
function assignRole(email: string): Role {
  // Admin: platform owner emails
  if (email.endsWith("@defrag.app")) return "admin"
  // Default: operator for any Access-verified user
  return "operator"
}
