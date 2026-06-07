# Billing Email Templates

## Standard

- **From:** `Sovereign.os <info@defrag.app>`
- **Reply-To:** `info@defrag.app`
- **Provider:** Cloudflare `send_email` binding (preferred) → Resend API (fallback)
- **Implementation:** `apps/worker/src/email.ts`

When `sovereign.os` Email Routing is active, update From/Reply-To to `info@sovereign.os`.

---

## Templates

### 1. Welcome / Pro Activated

**Subject:** `Pro is active — Sovereign.os`

**Trigger:** Stripe `customer.subscription.created` or `invoice.payment_succeeded` (first payment)

**Body:**
```
Pro is active.

Your Baseline Design is set. The thread is grounded. You now have access to the full pattern.

What unlocked:
Unlimited sessions · Your Story · Compare With Someone · Try It Out · Covenant space · Full history

[Enter your space] → https://app.defrag.app/apps/defrag
```

**Implementation:** `sendWelcomeEmail()` in `apps/worker/src/email.ts`

---

### 2. Payment Succeeded (Renewal)

**Subject:** `Subscription renewed — Sovereign.os`

**Trigger:** Stripe `invoice.payment_succeeded` (renewal, not first payment)

**Body:**
```
Your subscription renewed.

Your Pro access continues. The thread stays grounded.

[Enter your space] → https://app.defrag.app/apps/defrag
```

**Implementation:** `sendPaymentSucceededEmail()` in `apps/worker/src/email.ts`

---

### 3. Payment Failed

**Subject:** `Payment failed — action required — Sovereign.os`

**Trigger:** Stripe `invoice.payment_failed`

**Body:**
```
Payment did not go through.

We were unable to process your subscription payment. Your access continues while we retry.

To keep Pro active, update your payment method.

[Update Payment Method] → https://billing.stripe.com/p/login

Questions? info@defrag.app
```

**Implementation:** `sendPaymentFailedEmail()` in `apps/worker/src/email.ts`

---

### 4. Subscription Canceled

**Subject:** `Subscription canceled — Sovereign.os`

**Trigger:** Stripe `customer.subscription.deleted`

**Body:**
```
Your Pro subscription has been canceled.

Your account has returned to the free tier. Your Baseline Design and saved history remain available.

You can resubscribe at any time.

[Return to your space] → https://app.defrag.app

Questions? info@defrag.app
```

**Implementation:** `sendCancellationEmail()` in `apps/worker/src/email.ts`

---

## Stripe Webhook Events Handled

| Event | Template | Handler |
|---|---|---|
| `customer.subscription.created` | Welcome | `sendWelcomeEmail` |
| `invoice.payment_succeeded` | Welcome (first) or Renewal | `sendWelcomeEmail` / `sendPaymentSucceededEmail` |
| `invoice.payment_failed` | Payment Failed | `sendPaymentFailedEmail` |
| `customer.subscription.deleted` | Canceled | `sendCancellationEmail` |

All webhook events are verified via HMAC-SHA256 signature check in `apps/worker/src/billing.ts`.

---

## Cloudflare Dashboard Prerequisites

Before billing emails can use the `send_email` binding:

1. Email Routing must be enabled on `defrag.app` (**Email → Email Routing → defrag.app**)
2. Destination address must be verified (**Email Routing → Destination addresses**)
3. `[[send_email]]` binding must be added to `apps/worker/wrangler.toml`
4. `sovereign-os-api` must be redeployed

Until then, billing emails are sent via Resend API (`RESEND_API_KEY` Worker secret).