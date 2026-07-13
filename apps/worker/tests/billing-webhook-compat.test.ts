import { describe, expect, it } from "vitest"
import {
  isSubscriptionInvoiceEvent,
  needsCreatedTimestampNormalization,
  validateKnownLifecycleEvent,
} from "../src/billing-webhook-compat.js"

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

  it("accepts a complete subscription lifecycle event", () => {
    expect(validateKnownLifecycleEvent({
      id: "evt_1",
      type: "customer.subscription.updated",
      created: 1_000,
      data: { object: { id: "sub_1", customer: "cus_1", status: "active" } },
    })).toEqual({ valid: true })
  })

  it("rejects malformed subscription events before idempotency storage", () => {
    expect(validateKnownLifecycleEvent({
      id: "evt_1",
      type: "customer.subscription.updated",
      created: 1_000,
      data: { object: { customer: "cus_1" } },
    })).toEqual({ valid: false, reason: "invalid_subscription" })
  })

  it("rejects malformed checkout completion events", () => {
    expect(validateKnownLifecycleEvent({
      id: "evt_2",
      type: "checkout.session.completed",
      created: 1_000,
      data: { object: { customer: "cus_1" } },
    })).toEqual({ valid: false, reason: "invalid_checkout_session" })
  })
})
