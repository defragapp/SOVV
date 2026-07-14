import { describe, expect, it } from "vitest"
import { fulfillBaselineGuidePurchase } from "../src/commerce-webhook.js"
import type { Env } from "../src/types-env.js"

function envWithKV() {
  const values = new Map<string, string>()
  const env = {
    KV: {
      get: async (key: string) => values.get(key) ?? null,
      put: async (key: string, value: string) => { values.set(key, value) },
    },
  } as unknown as Env
  return { env, values }
}

describe("Baseline Guide webhook fulfillment", () => {
  it("stores a durable purchase for a paid Baseline Guide session", async () => {
    const { env, values } = envWithKV()
    const response = await fulfillBaselineGuidePurchase({
      id: "evt_guide_1",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_live_guide_1",
          mode: "payment",
          payment_status: "paid",
          client_reference_id: "user_1",
          payment_intent: "pi_guide_1",
          amount_total: 1000,
          currency: "usd",
          metadata: { purchaseType: "baseline_guide", userId: "user_1" },
        },
      },
    }, env)

    expect(response?.status).toBe(200)
    expect(values.has("purchase:baseline-guide:user_1")).toBe(true)
    expect(values.get("stripe_event:evt_guide_1")).toBe("baseline_guide")
  })

  it("ignores unrelated checkout events", async () => {
    const { env, values } = envWithKV()
    const response = await fulfillBaselineGuidePurchase({
      id: "evt_subscription_1",
      type: "checkout.session.completed",
      data: { object: { metadata: { purchaseType: "subscription" } } },
    }, env)

    expect(response).toBeNull()
    expect(values.size).toBe(0)
  })

  it("rejects unpaid Baseline Guide sessions", async () => {
    const { env, values } = envWithKV()
    const response = await fulfillBaselineGuidePurchase({
      id: "evt_guide_2",
      type: "checkout.session.completed",
      data: {
        object: {
          mode: "payment",
          payment_status: "unpaid",
          client_reference_id: "user_2",
          metadata: { purchaseType: "baseline_guide" },
        },
      },
    }, env)

    expect(response?.status).toBe(400)
    expect(values.size).toBe(0)
  })
})
