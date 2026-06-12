# Email Standard

## Contact Standard

## Public Contact Address

**One primary public inbox: `info@defrag.app`**

This address handles:
- General product questions
- Support requests
- Privacy and data requests
- Legal questions
- Account help

Do not publish separate role inboxes (`privacy@`, `legal@`, `billing@`, `security@`) unless legally required or operationally necessary. All public-facing copy, UI, docs, and email templates must use `info@defrag.app`.

---

## Where info@defrag.app Appears

| Location | Current Status |
|---|---|
| `apps/web/app/contact/page.tsx` | ✅ `info@defrag.app` |
| `apps/web/app/privacy/page.tsx` | ✅ `info@defrag.app` |
| `apps/web/app/terms/page.tsx` | ✅ `info@defrag.app` |
| `apps/worker/src/email.ts` (SUPPORT const) | ✅ `info@defrag.app` |
| `docs/operator-playbook.md` | ✅ `info@defrag.app` |
| `docs/support-escalation.md` | ✅ `info@defrag.app` |
| `docs/legal-positioning.md` | ✅ `info@defrag.app` |

---

## Transactional Email Standard

**From:** `Sovereign.os <info@defrag.app>`
**Reply-To:** `info@defrag.app`
**Provider:** Resend API (current) → Cloudflare send_email binding (preferred, pending Email Routing setup)

### Subject Line Standard

| Event | Subject |
|---|---|
| Welcome / Pro activated | `Pro is active — Sovereign.os` |
| Payment succeeded | `Subscription renewed — Sovereign.os` |
| Payment failed | `Payment failed — action required — Sovereign.os` |
| Cancellation | `Subscription canceled — Sovereign.os` |

---

## Email Worker Implementation Notes

`apps/worker/src/email.ts` sends transactional lifecycle emails via Resend.

The `EMAIL?: SendEmail` binding in `types-env.ts` is declared but not yet wired in `wrangler.toml`. To activate Cloudflare native email:

1. Complete Email Routing setup (see `docs/email-routing-standard.md`)
2. Add `[[send_email]]` binding to `apps/worker/wrangler.toml`
3. Update `email.ts` to use `env.EMAIL.send(...)` as primary path with Resend as fallback

### Queue-based email (recommended pattern)

For high-volume or deferred email, queue jobs via `PATTERN_QUEUE` or a dedicated email queue:

```ts
// In billing.ts or auth.ts — queue the email job
await env.QUEUE.send({
  type: "email",
  template: "welcome",
  to: user.email,
});

// In queue consumer — send via Resend or send_email binding
```

This decouples email sending from the request path and improves reliability.

---

## Domain Availability

| Domain | In Cloudflare | Email Available |
|---|---|---|
| `defrag.app` | ✅ | ✅ Configure Email Routing |
| `sovereign.os` | ❌ Not registered | ❌ Not available |
| `covenant.app` | ❌ Not registered | ❌ Not available |

Do not reference `sovereign.os` or `covenant.app` email addresses in any docs, UI, or templates until those domains are registered and added to Cloudflare.

---

## Drift Prevention

Run this check before any release:

```bash
# Verify no privacy@/legal@ addresses in user-facing copy
grep -rn "privacy@defrag\|legal@defrag\|covenant\.app\|sovereign\.os" \
  apps/web/app/ apps/web/components/ apps/worker/src/ docs/ \
  | grep -v "node_modules\|.git\|# Future\|if.*sovereign\.os\|email-routing-standard"
```

Expected result: zero matches (or only future-state comments).

## Routing Standard

## Domain Status

| Domain | In Cloudflare Account | Email Routing Available |
|---|---|---|
| `defrag.app` | ✅ Yes | ✅ Configure via dashboard |
| `sovereign.os` | ❌ Not in account | ❌ Not available until domain is registered and zone added |
| `covenant.app` | ❌ Not in account | ❌ Not available — do not configure |

**All email must use `defrag.app` until `sovereign.os` is registered and added to Cloudflare.**

---

## Cloudflare send_email Binding — Constraints

Per Cloudflare documentation:

- `send_email` bindings require **Email Routing to be enabled** on the sending domain.
- The **destination address must be verified** before the binding can be used.
- The **sender address must be from the domain where Email Routing is active** (e.g., `info@defrag.app` requires Email Routing active on `defrag.app`).
- You cannot send from an unverified or unconfigured domain.
- The binding is declared in `wrangler.toml` as `[[send_email]]` with `name` and `destination_address`.
- Do not add the binding until Email Routing is enabled and the destination is verified.

---

## Public Contact Standard

| Address | Purpose | Status |
|---|---|---|
| `info@defrag.app` | Primary public inbox — all support, contact, privacy, legal | ✅ Required |
| `info@sovereign.os` | Preferred platform sender when sovereign.os zone is active | ⏳ Future only |
| `billing@defrag.app` | Optional billing fallback | Only if operationally needed |
| `security@defrag.app` | Optional security contact | Only if operationally needed |

**Do not create or document** `privacy@defrag.app`, `legal@defrag.app`, `support@defrag.app`, `admin@defrag.app`, `hello@defrag.app`, or `info@covenant.app`. Route all public contact through `info@defrag.app`.

---

## Cloudflare Email Routing Setup — Dashboard Steps

### Step 1 — Enable Email Routing on defrag.app

1. Cloudflare Dashboard → **Email** → **Email Routing**
2. Select zone: `defrag.app`
3. Click **Get started** or **Enable Email Routing**
4. Cloudflare will automatically add required MX and SPF/DMARC records
5. Verify the DNS records are active before proceeding

### Step 2 — Add and verify destination address

1. Email Routing → **Destination addresses**
2. Click **Add destination address**
3. Enter the private forwarding email address (do **not** commit this to the repo)
4. Cloudflare sends a verification email — click the link to verify
5. Status must show **Verified** before proceeding to Step 3

### Step 3 — Create routing rule for info@defrag.app

1. Email Routing → **Routing rules**
2. Click **Create address**
3. Custom address: `info`
4. Action: **Send to an email** → select verified destination address
5. Save and confirm rule is active

### Step 4 — (Optional) Bind Email Worker for inbound handling

If you need custom inbound logic (auto-reply, queue notification, routing):

1. Create `apps/worker-email/src/index.ts` with an `email` handler
2. Deploy as a separate Worker or add to `sovereign-os-api`
3. In Email Routing → Routing rules → set action to **Send to a Worker**
4. Select the deployed Worker

**Cloudflare constraint:** The Email Worker receives inbound messages. It can forward them (`message.forward()`), reply, or queue a job. It cannot send outbound email to arbitrary addresses without a verified `send_email` binding.

### Step 5 — Add send_email binding (after Step 2 is complete)

Only after Email Routing destination is verified:

Add to `apps/worker/wrangler.toml`:
```toml
[[send_email]]
name = "EMAIL"
destination_address = "info@defrag.app"
```

Then redeploy `sovereign-os-api`:
```bash
cd apps/worker && wrangler deploy
```

**Cloudflare constraint:** The `destination_address` in `[[send_email]]` must match a verified destination address in Email Routing. The sender (`From:`) must be from the domain where Email Routing is active (`defrag.app`).

### Step 6 — (Future) sovereign.os Email Routing

Only when `sovereign.os` is registered and added to Cloudflare:

1. Enable Email Routing on `sovereign.os` zone
2. Add `info@sovereign.os` routing rule → same verified destination
3. Update transactional email `From` to `Sovereign.os <info@sovereign.os>`
4. Keep `info@defrag.app` as a valid alias
5. Add `[[send_email]]` binding for `sovereign.os` sender

**Do not configure sovereign.os email until the domain is in the Cloudflare account.**

---

## Transactional Email Implementation

Current implementation: `apps/worker/src/email.ts`

**Delivery path (priority order):**
1. Cloudflare `send_email` binding (`env.EMAIL`) — preferred, pending Email Routing setup
2. Resend API (`env.RESEND_API_KEY`) — current active fallback

**From:** `Sovereign.os <info@defrag.app>`
**Reply-To:** `info@defrag.app`

When `sovereign.os` Email Routing is active:
**From:** `Sovereign.os <info@sovereign.os>`
**Reply-To:** `info@sovereign.os`

---

## Inbound Auto-Response Constraint

Cloudflare Email Workers can receive inbound email and forward it. However:

- **Outbound auto-reply** from an Email Worker requires a verified `send_email` binding.
- The binding sender must be from the Email Routing-active domain.
- If `send_email` binding is not yet configured, auto-reply is **not possible** with Cloudflare native tooling alone.
- **Workaround:** Queue an inbound notification job via `PATTERN_QUEUE` and process it in the queue consumer, which can call Resend API as a fallback.

Document this blocker clearly: auto-reply to `info@defrag.app` inbound messages requires completing Steps 1–5 above before it can be implemented natively.

---

## Drift Prevention

```bash
# Verify no extra role inboxes in user-facing copy
grep -rn "privacy@\|legal@\|support@defrag\|admin@defrag\|hello@defrag\|billing@defrag\|security@defrag" \
  apps/web/app/ apps/web/components/ apps/worker/src/ \
  | grep -v "node_modules\|# Future\|optional future\|email-routing-standard\|contact-and-email\|05_PRODUCT\|03_AI"
```

Expected result: zero matches.

## Billing Email Templates

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

## Marketing Email Templates

## Standard

- **From:** `Sovereign.os <info@defrag.app>`
- **Reply-To:** `info@defrag.app`
- **Contact:** `info@defrag.app`

When `sovereign.os` Email Routing is active, update From/Reply-To to `info@sovereign.os`.

Marketing emails are not yet implemented as automated sends. This document defines the approved templates for future use.

---

## Templates

### 1. Onboarding — Baseline Design Reminder

**Subject:** `Your Baseline Design is waiting — Sovereign.os`

**Trigger:** User registered but has not set Baseline Design after 24 hours

**Body:**
```
You signed up for Sovereign.os.

Your Baseline Design is the starting map — how you tend to process, respond, connect, protect, communicate, and return to center.

Without it, the thread has no ground to stand on.

It takes about 2 minutes to set.

[Start Your Baseline Design] → https://app.defrag.app/settings

Questions? info@defrag.app
```

---

### 2. Re-engagement — Return to Your Space

**Subject:** `Your space is still here — Sovereign.os`

**Trigger:** User has not logged in for 14+ days (future automation)

**Body:**
```
Your Baseline Design and saved history are still here.

Defrag helps you understand what is active in the moment — before you send the message, when the conversation keeps repeating, when you need to see the pattern clearly.

[Return to your space] → https://app.defrag.app/apps/defrag

Questions? info@defrag.app
```

---

### 3. Upgrade Prompt — Session Limit Reached

**Subject:** `You've reached today's limit — Sovereign.os`

**Trigger:** User hits free tier session limit (currently handled in-app; email is future)

**Body:**
```
You've used your free sessions for today.

Pro keeps the thread going — unlimited sessions, Your Story, Compare With Someone, Try It Out, and the Covenant reflection space.

[Upgrade to Pro] → https://app.defrag.app/login

Questions? info@defrag.app
```

---

## Implementation Notes

Marketing emails are not yet wired to an automated send path. When implementing:

1. Use the same `sendEmail()` function in `apps/worker/src/email.ts`
2. Queue marketing email jobs via `PATTERN_QUEUE` or a dedicated marketing queue
3. Process in a queue consumer — do not send synchronously from request handlers
4. Respect unsubscribe preferences — add `List-Unsubscribe` header
5. Do not send marketing email to users who have not opted in

---

## Language Rules for All Marketing Email

- Use "Defrag" not "DEFRAG" in body copy
- Use "Baseline Design" not "baseline" or "Your Baseline"
- Use "your space" not "workspace" or "Workbench"
- Use "Defrag helps you understand what is active in the moment" not "got lit up"
- Do not make claims about outcomes, accuracy, or clinical standing
- Do not use therapy, diagnosis, or guarantee language
- Keep tone: calm, direct, restrained, product-led