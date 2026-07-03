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

## The Glass Standard (Phase 19 — permanent edict)
**No rounded-full on text buttons or nav items.** `rounded-full` is reserved only for decorative 1–2px glow dots.

Button shape hierarchy:
- Primary hero CTA ("Enter Sovereign.os"): `rounded-2xl`, `background: #f4efe9`, `color: #08070a`, `hover:opacity-90` — never `hover:bg-*` fill change.
- Pure amber Pro CTA (Pricing Pro tier only): `rounded-2xl`, `background: #e0743a`, `color: #08070a`, `hover:opacity-90`.
- Glass secondary (interior actions, "Start Free"): `rounded-2xl`, `background: rgba(255,255,255,0.06)`, `boxShadow: 0 0 0 1px rgba(255,255,255,0.08) inset`, `backdropFilter: blur(12px)`.
- FloatingNav tabs: outer container `rounded-2xl`, individual tab items `rounded-xl` with glass active state (backdrop-blur + inset ring shadow) — never flat fill.

`GlassButton` component at `src/components/ui/GlassButton.tsx` — use for `<button>` elements; use inline motion.a styles for anchor CTAs.

`--radius-button` in index.css is `12px` (rounded-xl). `btn-primary` / `btn-secondary` CSS classes remain defined but are fully eradicated from all component files.

**"Spaces" not "workspace":** All routes are `/apps/defrag`, `/apps/covenant`, `/apps/alignment` — no `/workspace` suffix. OsOutput.tsx href navigates to `/apps/SPACENAME` directly.
