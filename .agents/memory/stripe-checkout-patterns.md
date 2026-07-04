---
name: Stripe checkout patterns
description: Key decisions and gotchas for the Stripe checkout integration in Sovereign.os
---

## API version
Always derive the correct `apiVersion` string from the installed SDK at build time:
```
node -e "const Stripe = require('./node_modules/stripe'); const s = new Stripe('x'); console.log(s.getApiField('version'))"
```
As of Stripe SDK 22.3.0, the version is `"2026-06-24.dahlia"`. Hard-coding a stale version causes a TypeScript compile failure.

**Why:** The Stripe TS types only accept the literal string for the bundled API version; any mismatch is a type error.

## Origin allowlisting
`checkout.ts` reads `ALLOWED_ORIGINS` from env (comma-separated). When set, unknown origins are rejected with HTTP 400. When empty (dev), falls back to the request Origin header.

**Why:** Passing the raw Origin header directly into `success_url`/`cancel_url` is an open-redirect vector — attacker-controlled origins can point Stripe redirects at phishing pages.

**How to apply:** Set `ALLOWED_ORIGINS=https://sovereign.os,https://www.sovereign.os` in production env vars before deploying.

## Local tier gate
`src/lib/tier.ts` — `setLocalPremium()` / `readLocalTier()` — localStorage key `sovv_tier=premium`.
`CovenantPage` detects `?session_id=` query param on mount, calls both functions, then cleans the URL.
`UserContext` ORs the local flag with the backend tier: `isPremium = user?.tier === 'pro' || localPremium`.

**Why:** Stripe redirects back before the Cloudflare webhook fires, so the backend may not yet know the user is pro. The local flag bridges that gap immediately.

## Double-click guard
PremiumGate's `handleCheckout` starts with `if (loading) return;` before `setLoading(true)` to prevent multiple concurrent Stripe session POSTs from rapid clicks.

## Pro upgrade attribution — the money-critical rule
A paid checkout only grants Pro if the Stripe session carries `metadata.user_id`. The webhook's `checkout.session.completed` handler keys the tier upgrade off `session.metadata.user_id`. Only the **authed** `POST /api/billing/checkout` (requireAuth) sets that metadata; any anonymous checkout endpoint creates a session that takes money and grants nothing.

**Why:** an earlier anonymous `/api/checkout` route was wired to two CTAs (PremiumGate, marketing upgrade banner) — customers could have paid and never been upgraded. That route was removed; every upgrade CTA must go through `/api/billing/checkout` and, on 401, redirect to `/app/login?next=/pricing`.

**How to apply:** never add an anonymous/unauthenticated checkout CTA. Every purchase path must be attributable to a logged-in user before the Stripe session is created.

## Production config required for live monetization (not code — env/dashboard)
These are unset in this Repl and will silently break paid upgrades in production:
- `STRIPE_WEBHOOK_SECRET` — webhook.ts rejects all events in production without it (dev accepts unsigned), so no `checkout.session.completed` → no Pro upgrade.
- A Stripe Dashboard webhook endpoint pointing at `https://<prod-domain>/api/stripe/webhook`.
- `ALLOWED_ORIGINS` (comma-separated, includes the prod domain) — billing.ts `getAllowedOrigins()` falls back to `REPLIT_DEV_DOMAIN`, then localhost; in production without it, real users get HTTP 403 "Origin not allowed" on checkout.

**Why:** checkout works in dev via `REPLIT_DEV_DOMAIN` and unsigned webhooks, masking these gaps until deploy.
