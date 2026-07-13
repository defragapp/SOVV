import { describe, expect, it } from "vitest"
import { isSubscriptionInvoiceEvent, needsCreatedTimestampNormalization } from "../src/billing-webhook-compat.js"

describe("billing webhook compatibility", () => {
  it("accepts subscription invoice events", () => {
    expect(isSubscriptionInvoiceEvent({
      type: "invoice.payment_succeeded",
      data: { object: { subscription: "sub_123" } },
    })).toBe(true)
  })

  it("ignores non-subscription invoice events", () => {
    expect(isSubscriptionInvoiceEvent({
      type: "invoice.payment_succeeded",
      data: { object: {} },
    })).toBe(false)
  })

  it("does not filter non-invoice lifecycle events", () => {
    expect(isSubscriptionInvoiceEvent({
      type: "customer.subscription.updated",
      data: { object: {} },
    })).toBe(true)
  })

  it("normalizes a legitimate retry whose event creation is older than five minutes", () => {
    expect(needsCreatedTimestampNormalization({ created: 1_000 }, 1_301)).toBe(true)
  })

  it("preserves a recent event creation timestamp", () => {
    expect(needsCreatedTimestampNormalization({ created: 1_000 }, 1_300)).toBe(false)
  })
})
