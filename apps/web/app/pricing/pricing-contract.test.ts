import { describe, expect, it } from "vitest"
import { FREE_FEATURES, LAUNCH_PRICING, PRO_FEATURES } from "./pricing-contract"

describe("launch pricing contract", () => {
  it("matches the active Stripe catalog", () => {
    expect(LAUNCH_PRICING.monthlyPriceUsd).toBe(20)
    expect(LAUNCH_PRICING.annualPriceUsd).toBe(99)
    expect(LAUNCH_PRICING.monthlyStripePriceId).toBe("price_1Te0g9Bk78yJ8Hww8fFZCqhm")
    expect(LAUNCH_PRICING.annualStripePriceId).toBe("price_1Tq6nPBk78yJ8Hwwm0pxg4hH")
  })

  it("keeps free and pro limits aligned with launch copy", () => {
    expect(LAUNCH_PRICING.freeDailySessions).toBe(15)
    expect(FREE_FEATURES).toContain("15 sessions per day")
    expect(PRO_FEATURES).toContain("Unlimited sessions")
  })

  it("exposes only supported checkout plan names", () => {
    expect([LAUNCH_PRICING.monthlyPlan, LAUNCH_PRICING.annualPlan]).toEqual(["monthly", "annual"])
  })
})
