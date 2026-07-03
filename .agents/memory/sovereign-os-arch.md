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

## Platform positioning (Phase 20)
Sovereign.os = **Private Intelligence Operating System** — not a relationship/healing tool. All marketing copy uses OS framing.
Core hook (present on every marketing page): "Most AI responds to what you type. Sovereign.os understands the pattern you're typing from."
OS layer architecture (About grid, How It Works steps, Pricing copy):
- Baseline Design: core pattern layer, travels across all apps
- Defrag.app: untangle the moment
- Alignment.app: choose the cleaner move
- Covenant.app: understand what the moment belongs to
Pricing tiers: Free = "Start with one moment." / Pro = "Unlock your operating system." / Network = Coming Soon (muted locked card, opacity-50).

## Zero-Edge Architecture — Phase 21 rules
No `bg-[#1C1C1E]` + `ring-1` card containers inside interior spaces. Content sits directly on the dark canvas.
- DiagnosticCard → mono label + `pb-8` content + `h-px bg-white/[0.06]` hairline; NO rounded wrapper, NO bg.
- SkeletonCard → bare div, hairline at bottom; NO bg, NO ring.
- ErrorCard → mono label + plain text + hairline; NO card.
- DropZone form → textarea on canvas; `h-px bg-white/[0.06]` top hairline, `border-t border-white/[0.05]` footer.
- Archive/Covenant list → `border-t border-white/[0.06]` at top only; rows `border-b border-white/[0.08]`.
- Empty states → mono label + text, no card container.
- PremiumGate → zero-edge floating: amber line, mono space label, Fraunces `text-3xl` headline (tagline prop), description, cream `rounded-2xl` CTA — no outer card.
- Full-screen modals (ArchiveDetail, CovenantDetail) → keep `rounded-3xl ring-1` for overlay containment; use `rgba(8,7,10,0.95)` + `backdropFilter: blur(24px)` instead of `#1C1C1E`.
