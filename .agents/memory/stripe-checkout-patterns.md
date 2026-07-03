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
