from pathlib import Path
from textwrap import dedent

AUTH_PATH = Path("apps/worker/src/auth.ts")
TEST_PATH = Path("apps/worker/tests/auth-cookies.test.ts")

text = AUTH_PATH.read_text()


def replace_once(old: str, new: str) -> None:
    global text
    old = dedent(old)
    new = dedent(new)
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one match, found {count}: {old[:120]!r}")
    text = text.replace(old, new, 1)


replace_once(
    '''
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
    ''',
    '''
    export function tierCookie(
      tier: string,
      maxAge = 7 * 24 * 60 * 60,
      cookieDomainValue?: string,
    ): string {
      const domain = cookieDomain(cookieDomainValue)
      return [
        `__sov_tier=${encodeURIComponent(tier || "free")}`,
        `Max-Age=${maxAge}`,
        "Path=/",
        ...(domain ? [`Domain=${domain}`] : []),
        "Secure",
        "SameSite=Lax",
      ].join("; ")
    }
    ''',
)

replace_once(
    '''
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
    ''',
    '''
    export function roleCookie(
      role: string,
      maxAge = 7 * 24 * 60 * 60,
      cookieDomainValue?: string,
    ): string {
      const domain = cookieDomain(cookieDomainValue)
      return [
        `__sov_role=${encodeURIComponent(role || "user")}`,
        `Max-Age=${maxAge}`,
        "Path=/",
        ...(domain ? [`Domain=${domain}`] : []),
        "Secure",
        "SameSite=Lax",
      ].join("; ")
    }
    ''',
)

replace_once(
    'import { logSafetyEvent } from "./safety.js";\n',
    'import { logSafetyEvent } from "./safety.js";\nimport { resolveEntitlements } from "./entitlements.js";\n',
)

replace_once(
    '''
    export type AuthUser = {
      id: string
      email: string
      tier: string
      role: string
      stripe_customer_id: string | null | undefined
      subscription_status: string
    }
    ''',
    '''
    export type AuthUser = {
      id: string
      email: string
      tier: string
      role: string
      stripe_customer_id: string | null | undefined
      subscription_status: string
      subscription_current_period_end: number | null
      email_verified: number
    }
    ''',
)

replace_once(
    '"SELECT u.id, u.email, u.tier, u.role, u.stripe_customer_id, COALESCE(u.subscription_status, \'free\') as subscription_status FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?"',
    '"SELECT u.id, u.email, u.tier, u.role, u.stripe_customer_id, COALESCE(u.subscription_status, \'free\') as subscription_status, u.subscription_current_period_end, COALESCE(u.email_verified, 0) as email_verified FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?"',
)

replace_once(
    '''
        subscription_status: string | null
      }>()
    ''',
    '''
        subscription_status: string | null
        subscription_current_period_end: number | null
        email_verified: number | null
      }>()
    ''',
)

replace_once(
    '''
        subscription_status: session.subscription_status || "free",
      }
    ''',
    '''
        subscription_status: session.subscription_status || "free",
        subscription_current_period_end: session.subscription_current_period_end ?? null,
        email_verified: session.email_verified ?? 0,
      }
    ''',
)

replace_once(
    'const SESSION_TTL = 7 * 24 * 60 * 60\n\nexport async function registerAuthRoutes',
    'const SESSION_TTL = 7 * 24 * 60 * 60\n\nfunction isPrivilegedRole(role: string): boolean {\n  return role === "owner" || role === "admin"\n}\n\nexport async function registerAuthRoutes',
)

replace_once('"Cookie": `session=${token}`', '"Cookie": `__sov_session=${token}`')
replace_once(
    'tierCookie(user.tier || "free", 7 * 24 * 60 * 60)',
    'tierCookie(user.tier || "free", 7 * 24 * 60 * 60, env.COOKIE_DOMAIN)',
)
replace_once(
    'roleCookie(user.role || "user", 7 * 24 * 60 * 60)',
    'roleCookie(user.role || "user", 7 * 24 * 60 * 60, env.COOKIE_DOMAIN)',
)
replace_once(
    'if (user.role !== "owner") return jsonResponse({ error: "Forbidden" }, 403)',
    'if (!isPrivilegedRole(user.role)) return jsonResponse({ error: "Forbidden" }, 403)',
)
replace_once(
    'if (!user || user.role !== "admin") return jsonResponse({ error: "Forbidden" }, 403);',
    'if (!user || !isPrivilegedRole(user.role)) return jsonResponse({ error: "Forbidden" }, 403);',
)
replace_once(
    'if (!user || user.role !== "admin") return jsonResponse({ error: "Forbidden" }, 403);',
    'if (!user || !isPrivilegedRole(user.role)) return jsonResponse({ error: "Forbidden" }, 403);',
)

replace_once(
    '''
      // GET /api/auth/tier
      router.get("/api/auth/tier", async (request: Request) => {
        const env = getEnv()
        const user = await getAuthUser(request, env.DB)
        if (!user) return jsonResponse({ tier: "free", subscription_status: "free" })
        return jsonResponse({ tier: user.tier, subscription_status: user.subscription_status })
      })
    ''',
    '''
      // GET /api/auth/tier
      router.get("/api/auth/tier", async (request: Request) => {
        const env = getEnv()
        const user = await getAuthUser(request, env.DB)
        if (!user) return jsonResponse({ tier: "free", subscription_status: "free" })
        const entitlements = resolveEntitlements({
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
        })
      })
    ''',
)

replace_once(
    '''
        return jsonResponse({
          tier: user.tier,
          subscription_status: user.subscription_status,
          has_active_subscription: user.subscription_status === "active" || user.tier === "pro",
        })
    ''',
    '''
        const entitlements = resolveEntitlements({
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
        })
    ''',
)

replace_once(
    '    const isPro = user.tier === "pro" || user.subscription_status === "active"',
    '''
        const entitlements = resolveEntitlements({
          id: user.id,
          tier: user.tier,
          role: user.role,
          subscription_status: user.subscription_status,
          subscription_current_period_end: user.subscription_current_period_end,
          email_verified: user.email_verified,
        })
        const isPro = entitlements.isActivePro
    '''.rstrip(),
)

replace_once(
    '''
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
    ''',
    '''
      // POST /api/auth/logout
      router.post("/api/auth/logout", async (request: Request) => {
        const env = getEnv()
        const cookieDomain = env.COOKIE_DOMAIN || undefined
        const token = getSessionToken(request)
        try {
          if (token) {
            await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run()
          }
          await env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?")
            .bind(Date.now()).run()
        } catch (error) {
          logSafetyEvent({ level: "warn", event: "auth_logout_cleanup_failed", request, error_type: "auth", error })
        }
        return new Response(JSON.stringify({ ok: true }), {
    ''',
)

AUTH_PATH.write_text(text)

tests = TEST_PATH.read_text()
old_import = 'import { clearCookie, getSessionToken, sessionCookie } from "../src/auth.js"'
new_import = 'import { clearCookie, getSessionToken, roleCookie, sessionCookie, tierCookie } from "../src/auth.js"'
if tests.count(old_import) != 1:
    raise SystemExit("Unexpected auth cookie test import")
tests = tests.replace(old_import, new_import, 1)

addition = dedent('''

  it("uses the configured domain for tier and role cookies", () => {
    expect(tierCookie("pro", 3600, ".defrag.app")).toContain("Domain=.defrag.app")
    expect(roleCookie("owner", 3600, ".defrag.app")).toContain("Domain=.defrag.app")
  })

  it("omits the domain for host-only tier and role cookies", () => {
    expect(tierCookie("free")).not.toContain("Domain=")
    expect(roleCookie("user")).not.toContain("Domain=")
  })
''')
marker = "\n})\n"
index = tests.rfind(marker)
if index == -1:
    raise SystemExit("Could not find auth cookie test suite closing marker")
tests = tests[:index] + addition + tests[index:]
TEST_PATH.write_text(tests)
