import { readFileSync, writeFileSync } from "node:fs"

const authPath = new URL("../src/auth.ts", import.meta.url)
const testPath = new URL("../tests/auth-cookies.test.ts", import.meta.url)
let source = readFileSync(authPath, "utf8")

function replaceOnce(oldText, newText, label) {
  if (source.includes(newText)) return
  const count = source.split(oldText).length - 1
  if (count !== 1) throw new Error(`${label}: expected one source anchor, found ${count}`)
  source = source.replace(oldText, newText)
}

replaceOnce(
`export function tierCookie(tier: string, maxAge = 7 * 24 * 60 * 60): string {
  return [
    \`__sov_tier=\${encodeURIComponent(tier || "free")}\`,
    \`Max-Age=\${maxAge}\`,
    "Path=/",
    "Domain=.defrag.app",
    "Secure",
    "SameSite=Lax",
  ].join("; ")
}`,
`export function tierCookie(
  tier: string,
  maxAge = 7 * 24 * 60 * 60,
  cookieDomainValue?: string,
): string {
  const domain = cookieDomain(cookieDomainValue)
  return [
    \`__sov_tier=\${encodeURIComponent(tier || "free")}\`,
    \`Max-Age=\${maxAge}\`,
    "Path=/",
    ...(domain ? [\`Domain=\${domain}\`] : []),
    "Secure",
    "SameSite=Lax",
  ].join("; ")
}`,
"tier cookie domain")

replaceOnce(
`export function roleCookie(role: string, maxAge = 7 * 24 * 60 * 60): string {
  return [
    \`__sov_role=\${encodeURIComponent(role || "user")}\`,
    \`Max-Age=\${maxAge}\`,
    "Path=/",
    "Domain=.defrag.app",
    "Secure",
    "SameSite=Lax",
  ].join("; ")
}`,
`export function roleCookie(
  role: string,
  maxAge = 7 * 24 * 60 * 60,
  cookieDomainValue?: string,
): string {
  const domain = cookieDomain(cookieDomainValue)
  return [
    \`__sov_role=\${encodeURIComponent(role || "user")}\`,
    \`Max-Age=\${maxAge}\`,
    "Path=/",
    ...(domain ? [\`Domain=\${domain}\`] : []),
    "Secure",
    "SameSite=Lax",
  ].join("; ")
}`,
"role cookie domain")

replaceOnce(
'import { logSafetyEvent } from "./safety.js";',
'import { logSafetyEvent } from "./safety.js";\nimport { resolveEntitlements } from "./entitlements.js";',
"entitlements import")

replaceOnce(
`export type AuthUser = {
  id: string
  email: string
  tier: string
  role: string
  stripe_customer_id: string | null | undefined
  subscription_status: string
}`,
`export type AuthUser = {
  id: string
  email: string
  tier: string
  role: string
  stripe_customer_id: string | null | undefined
  subscription_status: string
  subscription_current_period_end: number | null
  email_verified: number
}`,
"auth user entitlement fields")

replaceOnce(
`"SELECT u.id, u.email, u.tier, u.role, u.stripe_customer_id, COALESCE(u.subscription_status, 'free') as subscription_status FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?"`,
`"SELECT u.id, u.email, u.tier, u.role, u.stripe_customer_id, COALESCE(u.subscription_status, 'free') as subscription_status, u.subscription_current_period_end, COALESCE(u.email_verified, 0) as email_verified FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?"`,
"auth user query")

replaceOnce(
`      subscription_status: string | null
    }>()`,
`      subscription_status: string | null
      subscription_current_period_end: number | null
      email_verified: number | null
    }>()`,
"auth query result type")

replaceOnce(
`    subscription_status: session.subscription_status || "free",
  }`,
`    subscription_status: session.subscription_status || "free",
    subscription_current_period_end: session.subscription_current_period_end ?? null,
    email_verified: session.email_verified ?? 0,
  }`,
"auth user result")

replaceOnce(
`const SESSION_TTL = 7 * 24 * 60 * 60

export async function registerAuthRoutes`,
`const SESSION_TTL = 7 * 24 * 60 * 60

function isPrivilegedRole(role: string): boolean {
  return role === "owner" || role === "admin"
}

export async function registerAuthRoutes`,
"privileged role helper")

replaceOnce('"Cookie": `session=${token}`', '"Cookie": `__sov_session=${token}`', "verification session cookie")
replaceOnce('tierCookie(user.tier || "free", 7 * 24 * 60 * 60)', 'tierCookie(user.tier || "free", 7 * 24 * 60 * 60, env.COOKIE_DOMAIN)', "login tier cookie")
replaceOnce('roleCookie(user.role || "user", 7 * 24 * 60 * 60)', 'roleCookie(user.role || "user", 7 * 24 * 60 * 60, env.COOKIE_DOMAIN)', "login role cookie")
replaceOnce('if (user.role !== "owner") return jsonResponse({ error: "Forbidden" }, 403)', 'if (!isPrivilegedRole(user.role)) return jsonResponse({ error: "Forbidden" }, 403)', "admin me role")

for (let index = 0; index < 2; index += 1) {
  replaceOnce('if (!user || user.role !== "admin") return jsonResponse({ error: "Forbidden" }, 403);', 'if (!user || !isPrivilegedRole(user.role)) return jsonResponse({ error: "Forbidden" }, 403);', `admin role ${index + 1}`)
}

replaceOnce(
`    return jsonResponse({ tier: user.tier, subscription_status: user.subscription_status })`,
`    const entitlements = resolveEntitlements({
      id: user.id,
      tier: user.tier,
      role: user.role,
      subscription_status: user.subscription_status,
      subscription_current_period_end: user.subscription_current_period_end,
      email_verified: user.email_verified,
    })
    return jsonResponse({
      tier: entitlements.effectiveTier,
      subscription_status: user.subscription_status,
      is_in_grace_period: entitlements.isInGracePeriod,
    })`,
"tier endpoint")

replaceOnce(
`    return jsonResponse({
      tier: user.tier,
      subscription_status: user.subscription_status,
      has_active_subscription: user.subscription_status === "active" || user.tier === "pro",
    })`,
`    const entitlements = resolveEntitlements({
      id: user.id,
      tier: user.tier,
      role: user.role,
      subscription_status: user.subscription_status,
      subscription_current_period_end: user.subscription_current_period_end,
      email_verified: user.email_verified,
    })
    return jsonResponse({
      tier: entitlements.effectiveTier,
      subscription_status: user.subscription_status,
      has_active_subscription: entitlements.isActivePro,
      is_in_grace_period: entitlements.isInGracePeriod,
      deny_reason: entitlements.denyReason,
    })`,
"subscription endpoint")

replaceOnce(
`    const isPro = user.tier === "pro" || user.subscription_status === "active"`,
`    const entitlements = resolveEntitlements({
      id: user.id,
      tier: user.tier,
      role: user.role,
      subscription_status: user.subscription_status,
      subscription_current_period_end: user.subscription_current_period_end,
      email_verified: user.email_verified,
    })
    const isPro = entitlements.isActivePro`,
"usage entitlement")

replaceOnce(
`    const cookieDomain = env.COOKIE_DOMAIN || undefined
    // Clean up expired sessions opportunistically on logout
    try {
      await env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?")
        .bind(Date.now()).run()`,
`    const cookieDomain = env.COOKIE_DOMAIN || undefined
    const token = getSessionToken(request)
    try {
      if (token) {
        await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run()
      }
      await env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?")
        .bind(Date.now()).run()`,
"logout session revocation")

writeFileSync(authPath, source)

let tests = readFileSync(testPath, "utf8")
const oldImport = 'import { clearCookie, getSessionToken, sessionCookie } from "../src/auth.js"'
const newImport = 'import { clearCookie, getSessionToken, roleCookie, sessionCookie, tierCookie } from "../src/auth.js"'
if (!tests.includes(newImport)) {
  if (!tests.includes(oldImport)) throw new Error("auth cookie test import anchor missing")
  tests = tests.replace(oldImport, newImport)
}

const testAddition = `

  it("uses the configured domain for tier and role cookies", () => {
    expect(tierCookie("pro", 3600, ".defrag.app")).toContain("Domain=.defrag.app")
    expect(roleCookie("owner", 3600, ".defrag.app")).toContain("Domain=.defrag.app")
  })

  it("omits the domain for host-only tier and role cookies", () => {
    expect(tierCookie("free")).not.toContain("Domain=")
    expect(roleCookie("user")).not.toContain("Domain=")
  })`

if (!tests.includes('uses the configured domain for tier and role cookies')) {
  const marker = "\n})\n"
  const index = tests.lastIndexOf(marker)
  if (index < 0) throw new Error("auth cookie test suite closing marker missing")
  tests = tests.slice(0, index) + testAddition + tests.slice(index)
}
writeFileSync(testPath, tests)

console.log("Auth consistency source migration applied")
