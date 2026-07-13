/**
 * entitlements.test.ts
 *
 * Tests for the server-authoritative entitlements module.
 * Covers all Stripe subscription states, grace period, manual Pro,
 * admin role, and email verification gate.
 */

import { describe, it, expect } from "vitest"
import { resolveEntitlements, requireEntitlement } from "../src/entitlements.js"
import { requireActiveSubscription } from "../src/billing.js"
import type { EntitlementUser } from "../src/entitlements.js"

function makeUser(overrides: Partial<EntitlementUser> = {}): EntitlementUser {
  return {
    id: "user-1",
    tier: "free",
    role: "user",
    subscription_status: "free",
    subscription_current_period_end: null,
    email_verified: 1,
    ...overrides,
  }
}

describe("resolveEntitlements", () => {
  describe("active subscription", () => {
    it("grants full Pro access for active status", () => {
      const e = resolveEntitlements(makeUser({ subscription_status: "active", tier: "pro" }))
      expect(e.effectiveTier).toBe("pro")
      expect(e.canUseCovenant).toBe(true)
      expect(e.canUseAlignment).toBe(true)
      expect(e.canUseLibrary).toBe(true)
      expect(e.canUseAudio).toBe(true)
      expect(e.canInvite).toBe(true)
      expect(e.isActivePro).toBe(true)
      expect(e.denyReason).toBeNull()
    })

    it("grants full Pro access for trialing status", () => {
      const e = resolveEntitlements(makeUser({ subscription_status: "trialing", tier: "free" }))
      expect(e.effectiveTier).toBe("pro")
      expect(e.canUseCovenant).toBe(true)
      expect(e.isActivePro).toBe(true)
    })
  })

  describe("grace period", () => {
    it("grants Pro access when past_due within 72h grace", () => {
      const periodEnd = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      const e = resolveEntitlements(makeUser({
        subscription_status: "past_due",
        tier: "pro",
        subscription_current_period_end: periodEnd,
      }))
      expect(e.effectiveTier).toBe("pro")
      expect(e.isInGracePeriod).toBe(true)
      expect(e.canUseCovenant).toBe(true)
    })

    it("denies Pro access when past_due grace period expired", () => {
      const periodEnd = Math.floor(Date.now() / 1000) - (73 * 3600) // 73 hours ago
      const e = resolveEntitlements(makeUser({
        subscription_status: "past_due",
        tier: "pro",
        subscription_current_period_end: periodEnd,
      }))
      expect(e.effectiveTier).toBe("free")
      expect(e.isInGracePeriod).toBe(false)
      expect(e.canUseCovenant).toBe(false)
      expect(e.denyReason).toBe("grace_expired")
    })

    it("grants Pro access when unpaid within 72h grace", () => {
      const periodEnd = Math.floor(Date.now() / 1000) - 7200 // 2 hours ago
      const e = resolveEntitlements(makeUser({
        subscription_status: "unpaid",
        tier: "pro",
        subscription_current_period_end: periodEnd,
      }))
      expect(e.effectiveTier).toBe("pro")
      expect(e.isInGracePeriod).toBe(true)
    })
  })

  describe("canceled / incomplete", () => {
    it("denies Pro for canceled subscription", () => {
      const e = resolveEntitlements(makeUser({ subscription_status: "canceled", tier: "free" }))
      expect(e.effectiveTier).toBe("free")
      expect(e.canUseCovenant).toBe(false)
      expect(e.denyReason).toBe("subscription_canceled")
    })

    it("denies Pro for incomplete subscription", () => {
      const e = resolveEntitlements(makeUser({ subscription_status: "incomplete" }))
      expect(e.effectiveTier).toBe("free")
      expect(e.denyReason).toBe("not_subscribed")
    })

    it("denies Pro for incomplete_expired subscription", () => {
      const e = resolveEntitlements(makeUser({ subscription_status: "incomplete_expired" }))
      expect(e.effectiveTier).toBe("free")
      expect(e.denyReason).toBe("not_subscribed")
    })
  })

  describe("manual Pro grant", () => {
    it("grants Pro for tier=pro with status=free (admin override)", () => {
      const e = resolveEntitlements(makeUser({ tier: "pro", subscription_status: "free" }))
      expect(e.effectiveTier).toBe("pro")
      expect(e.isManualPro).toBe(true)
      expect(e.canUseCovenant).toBe(true)
    })
  })

  describe("admin role", () => {
    it("grants full access for admin role regardless of subscription", () => {
      const e = resolveEntitlements(makeUser({ role: "admin", tier: "free", subscription_status: "canceled" }))
      expect(e.effectiveTier).toBe("pro")
      expect(e.isAdmin).toBe(true)
      expect(e.canUseCovenant).toBe(true)
      expect(e.canUseAlignment).toBe(true)
    })
  })

  describe("email verification gate", () => {
    it("blocks Pro features for unverified email on active subscription", () => {
      const e = resolveEntitlements(makeUser({
        subscription_status: "active",
        tier: "pro",
        email_verified: 0,
      }))
      expect(e.effectiveTier).toBe("free")
      expect(e.canUseCovenant).toBe(false)
    })

    it("allows Pro features for verified email on active subscription", () => {
      const e = resolveEntitlements(makeUser({
        subscription_status: "active",
        tier: "pro",
        email_verified: 1,
      }))
      expect(e.effectiveTier).toBe("pro")
      expect(e.canUseCovenant).toBe(true)
    })

    it("allows Defrag (free) for unverified email", () => {
      const e = resolveEntitlements(makeUser({ email_verified: 0 }))
      expect(e.canUseDefrag).toBe(true)
    })
  })

  describe("free tier", () => {
    it("allows Defrag but blocks Pro features for free user", () => {
      const e = resolveEntitlements(makeUser())
      expect(e.effectiveTier).toBe("free")
      expect(e.canUseDefrag).toBe(true)
      expect(e.canUseCovenant).toBe(false)
      expect(e.canUseAlignment).toBe(false)
      expect(e.canUseLibrary).toBe(false)
      expect(e.canUseAudio).toBe(false)
      expect(e.canInvite).toBe(false)
      expect(e.denyReason).toBe("not_subscribed")
    })
  })
})

describe("requireEntitlement", () => {
  it("returns null when entitlement is granted", () => {
    const e = resolveEntitlements(makeUser({ subscription_status: "active", tier: "pro" }))
    expect(requireEntitlement(e, "canUseCovenant")).toBeNull()
  })

  it("returns 403 Response when entitlement is denied", () => {
    const e = resolveEntitlements(makeUser())
    const response = requireEntitlement(e, "canUseCovenant")
    expect(response).not.toBeNull()
    expect(response?.status).toBe(403)
  })

  it("includes denyReason in 403 response body", async () => {
    const e = resolveEntitlements(makeUser({ subscription_status: "canceled" }))
    const response = requireEntitlement(e, "canUseCovenant")
    const body = await response?.json() as any
    expect(body.denyReason).toBe("subscription_canceled")
    expect(body.error).toBe("subscription_required")
  })
})

describe("requireActiveSubscription compatibility gate", () => {
  const request = new Request("https://api.defrag.app/api/audio")

  it("denies a free user at an explicit Pro boundary", async () => {
    const response = await requireActiveSubscription(makeUser(), request)
    expect(response?.status).toBe(403)
  })

  it("allows a verified trialing user", async () => {
    const response = await requireActiveSubscription(
      makeUser({ subscription_status: "trialing" }),
      request,
    )
    expect(response).toBeNull()
  })

  it("allows an eligible user in the payment grace period", async () => {
    const response = await requireActiveSubscription(
      makeUser({
        subscription_status: "past_due",
        subscription_current_period_end: Math.floor(Date.now() / 1000) - 3600,
      }),
      request,
    )
    expect(response).toBeNull()
  })
})
