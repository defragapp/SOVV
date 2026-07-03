---
name: Sovereign.os Architecture Decisions
description: Space structure, provider tree, motion patterns, ambient layer placement, and baseline/archive design decisions for the Sovereign.os monorepo.
---

## Provider tree order (App.tsx)
`QueryClientProvider > UserProvider > ArchiveProvider > WouterRouter`
- `AmbientBackground` and `BaselineGate` live inside `WouterRouter` so they can call `useLocation()`, but outside `AnimatePresence` so they never flash on route change.

## AmbientBackground placement rule
Renders only on marketing routes (hides on `/apps/*` and `/app/*`). App spaces manage their own backgrounds via `SpaceShell`. Fixed `z-[-1]`, pointer-events-none.

## Baseline data
Stored in localStorage via `src/lib/baseline.ts` (`sovv_baseline` key). Sent client-side with every `/api/explain` POST as `{ message, baseline }`. Server injects it into the OpenAI system prompt only when present and non-empty.
**Why:** No backend user DB yet; localStorage keeps the feature shippable without a real auth backend. Real implementation moves baseline to server-side user record.

## BaselineGate pattern
`BaselineGate` in `App.tsx` shows the onboarding overlay (`fixed inset-0 z-50`) when `location.startsWith('/apps/')` AND `user !== null` AND `!hasBaseline`. This avoids a hard route redirect; the overlay sits on top of Defrag so the user can skip and still see the app.

## PremiumGate space union
`PremiumGateProps.space` must include every gated space name: currently `'Covenant' | 'Alignment' | 'Archive'`. Add here when new spaces are added.

## FloatingNav premium tab visibility
Premium-only tabs are **filtered out entirely** (not locked) when `!isPremium` — keeps the pill clean for free users. The amber lock pip only appears for gated tabs that ARE shown (historically Covenant/Alignment before the filter change).

## ArchiveContext seed data
3 mock patterns pre-seeded so the list reads as lived-in on day one. `save()` prepends newest-first.

## explain.ts baselineTriggered coercion
`validate()` normalises `baselineTriggered`: string `"true"/"false"` → boolean; any other non-boolean type → `false`. Always guaranteed to be boolean in the response, never undefined.

## motion.a vs Link for CTAs on marketing pages
Marketing CTAs that need physics (whileHover/whileTap) must use `motion.a` with inline styles, NOT `<Link className="btn-primary">`. `btn-primary` is a legacy CSS class — using it alongside Framer Motion props produces a code-review failure. The tactile standard: amber `rgba(224,116,58,0.90)` fill, `color: #08070a`, `scale: 1.02` hover / `scale: 0.97` tap, spring transition.
