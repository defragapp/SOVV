# Contact and Email Standard

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