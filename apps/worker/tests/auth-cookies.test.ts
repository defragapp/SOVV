import { describe, expect, it } from "vitest"
import { clearCookie, getSessionToken, sessionCookie } from "../src/auth.js"

describe("auth session cookies", () => {
  it("uses the configured cookie domain when setting a session", () => {
    const cookie = sessionCookie("token-123", 3600, ".defrag.app")

    expect(cookie).toContain("__sov_session=token-123")
    expect(cookie).toContain("Max-Age=3600")
    expect(cookie).toContain("Domain=.defrag.app")
    expect(cookie).toContain("HttpOnly")
    expect(cookie).toContain("Secure")
    expect(cookie).toContain("SameSite=Lax")
  })

  it("omits the Domain attribute when no cookie domain is configured", () => {
    const cookie = sessionCookie("token-123")

    expect(cookie).not.toContain("Domain=")
  })

  it("clears the session cookie using the configured domain", () => {
    const cookie = clearCookie(".defrag.app")

    expect(cookie).toContain("__sov_session=")
    expect(cookie).toContain("Max-Age=0")
    expect(cookie).toContain("Domain=.defrag.app")
    expect(cookie).toContain("HttpOnly")
  })

  it("reads the canonical __sov_session cookie", () => {
    const request = new Request("https://api.defrag.app/api/auth/session", {
      headers: {
        Cookie: "other=value; __sov_session=current-token; theme=dark",
      },
    })

    expect(getSessionToken(request)).toBe("current-token")
  })

  it("does not accept the obsolete session cookie name", () => {
    const request = new Request("https://api.defrag.app/api/auth/session", {
      headers: {
        Cookie: "session=legacy-token",
      },
    })

    expect(getSessionToken(request)).toBeNull()
  })
})
