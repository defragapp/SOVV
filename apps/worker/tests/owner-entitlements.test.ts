import { describe, expect, it } from "vitest"
import { resolveEntitlements } from "../src/entitlements.js"

describe("owner entitlements", () => {
  it("grants full platform access regardless of subscription state", () => {
    const entitlements = resolveEntitlements({
      id: "owner-1",
      tier: "free",
      role: "owner",
      subscription_status: "canceled",
      subscription_current_period_end: null,
      email_verified: 0,
    })

    expect(entitlements.effectiveTier).toBe("pro")
    expect(entitlements.isAdmin).toBe(true)
    expect(entitlements.canUseDefrag).toBe(true)
    expect(entitlements.canUseAlignment).toBe(true)
    expect(entitlements.canUseCovenant).toBe(true)
    expect(entitlements.canUseLibrary).toBe(true)
    expect(entitlements.canUseAudio).toBe(true)
    expect(entitlements.canInvite).toBe(true)
    expect(entitlements.denyReason).toBeNull()
  })
})
