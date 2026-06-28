# Sovereign.os — Release Readiness Checklist
**Version:** 1.0  
**Date:** 2026-06-28  
**Status:** Living document — update as items are resolved

---

## How to use this

Work through each section in order. Mark items `[x]` when confirmed.  
Do not mark an item complete without direct verification.  
If an item cannot be verified, note the blocker explicitly.

---

## 1. Core User Flows

### Auth
- [ ] Sign-up — account creation, email validation, Baseline Design onboarding
- [ ] Login — email + password, session cookie set correctly
- [ ] Logout — session deleted, cookie cleared
- [ ] Session persistence — cookie survives page reload
- [ ] Forgot password — reset email sent, link works, password updated
- [ ] Email verification — verification email sent, link works

### Stripe
- [ ] Checkout session creation — `/api/billing/checkout` returns redirect URL
- [ ] Stripe redirect — user lands on Stripe checkout page
- [ ] Webhook — `customer.subscription.created` updates tier to `pro`
- [ ] Webhook — `customer.subscription.deleted` reverts tier to `free`
- [ ] Webhook idempotency — duplicate events do not double-update
- [ ] UI reflects tier — Pro badge, space access, session limits correct

### Spaces
- [ ] Defrag — loads, input submits, result renders, save works
- [ ] Covenant — loads, input submits, result renders, save works (Pro only)
- [ ] Alignment — loads, input submits, result renders, save works (Pro only)
- [ ] Free tier gate — Covenant and Alignment show upgrade prompt for free users
- [ ] Daily limit — free users hit limit at correct count, upgrade prompt shown

### Library
- [ ] Save to Sovereign — result saves to library with correct workspace_source
- [ ] Library loads — items appear filtered by space
- [ ] Library item — individual item renders correctly
- [ ] Library empty state — correct message shown when empty

### Invite Privately
- [ ] Invite created — token generated, invite link works
- [ ] Invite accepted — consent record created
- [ ] Multi-user synthesis — runs with both baselines
- [ ] Revocation — consent revoked immediately, synthesis blocked

---

## 2. Tone & Language

- [ ] No therapy language in any user-facing surface
- [ ] No mystical or diagnostic language
- [ ] No motive attribution ("you feel...", "you are...")
- [ ] No predictions or certainty claims
- [ ] Space names correct: Defrag, Covenant, Alignment (not "workspace")
- [ ] "Open Space" (not "Open workspace") in all CTAs
- [ ] Canonical result labels used in ResultCard
- [ ] Safety response tone is calm, non-alarming, resource-focused

---

## 3. Visual Design

- [ ] Hero — hand image unobstructed, no panel overlay
- [ ] Hero — headline, subhead, CTAs visible on mobile and desktop
- [ ] Space pages — consistent dark OS baseline
- [ ] ResultCard — 7-section structure renders correctly
- [ ] Signature line — appears once, bottom only, low contrast
- [ ] Rail — quiet by default, expandable
- [ ] Error states — error.tsx renders for all 3 Spaces
- [ ] Loading states — spinner visible during AI processing
- [ ] Empty states — correct message when no results
- [ ] Mobile — all pages usable on iPhone Safari
- [ ] Safe area — no content clipped by notch or home indicator

---

## 4. Worker & Backend

- [ ] `/api/explain` — returns correct JSON with all 7 sections
- [ ] `/api/covenant` — returns correct JSON
- [ ] `/api/alignment` — returns correct JSON
- [ ] `/api/library` — filters by workspace_source correctly
- [ ] `/api/history` — returns session interactions
- [ ] `/api/auth/login` — sets session cookie with expires_at
- [ ] `/api/auth/logout` — deletes session
- [ ] `/api/billing/checkout` — creates Stripe session
- [ ] `/api/billing/webhook` — processes Stripe events
- [ ] Safety check — crisis inputs return supportResponse, not AI output
- [ ] CORS — credentials flow correctly from defrag.app
- [ ] Rate limiting — free tier limited to 15 sessions/day

---

## 5. Environment & Secrets

### Required secrets (set via `wrangler secret put`)
- [ ] `STRIPE_SECRET_KEY` — Stripe live secret key
- [ ] `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- [ ] `STRIPE_PRICE_ID` — Pro plan price ID (e.g. `price_xxx`)
- [ ] `COOKIE_DOMAIN` — set to `defrag.app`
- [ ] `RESEND_API_KEY` — email delivery fallback

### Required vars (set in wrangler.json)
- [ ] `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` — Pro plan price ID for frontend
- [ ] `APP_URL` — set to `https://app.defrag.app`
- [ ] `FREE_DAILY_LIMIT` — set to `"15"`

### GitHub integrations to remove
- [ ] Supabase GitHub App — remove from repo settings
- [ ] Cloudflare Workers and Pages GitHub App — remove or disconnect from SOVV repo

---

## 6. Build & Tests

- [ ] `npm run build` passes in `apps/web`
- [ ] TypeScript check passes in `apps/worker`
- [ ] All 8 CI jobs green on latest commit
- [ ] No `workspace:*` pnpm protocol in any package.json
- [ ] No `pnpm run build` in any wrangler.toml
- [ ] No orphaned JSX or syntax errors in any source file

---

## 7. Known Gaps (not yet implemented)

These items appear in the checklist above but are not yet built:

| Item | Status | Priority |
|------|--------|----------|
| `schema_version` in Worker responses | Not implemented | Medium |
| `provenance` field in responses | Not implemented | Medium |
| Consent audit logs | Not implemented | High |
| Story Engine / cinematic email | Not implemented | Low |
| Watch Preview (R2 cinematic assets) | Not implemented | Low |
| Public Preview (privacy stripping) | Not implemented | Medium |
| Pattern Queue Consumer (pattern extraction) | Partial — email consumer only | Medium |

---

*Last updated: 2026-06-28*
