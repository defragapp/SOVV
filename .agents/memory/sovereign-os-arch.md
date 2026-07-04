---
name: Sovereign.os Architecture Decisions
description: Space structure, provider tree, motion patterns, ambient layer placement, and baseline/archive design decisions for the Sovereign.os monorepo.
---

## Phases 22–24 — Cinematic OS Overhaul

### Ghost Code Removal (Phase 22)
17 ghost files deleted. Only `design-tokens.ts` was preserved (active source of truth despite no direct imports yet).
Pre-existing TS errors in `upgrade-banner.tsx` (`@/data/marketing` missing) and `motion-button.tsx` (ref type) — do NOT count as regressions.

### SpaceGlow — Per-Space Color Temperature (Phase 23)
New component: `src/components/spaces/SpaceGlow.tsx`
- Defrag: rgba(224,116,58,0.055) — warm amber
- Covenant: rgba(218,150,55,0.065) — golden-warm
- Alignment: rgba(80,120,210,0.055) — cool blue-indigo
- Archive: rgba(100,115,155,0.04) — quiet neutral
Fixed at `zIndex: 0`; space content wrappers use `relative z-10` above it. Integrated in `space-shell.tsx` via `spaceName` → `SpaceVariant` mapping.

### AmbientBackground Reactive "Breath" (Phase 24)
`App.tsx`: listens to `keydown` + `mousemove` to set `awake` state. Blobs scale to 1.07 + opacity 1.0 when awake; idle after 1800ms. `useRef<ReturnType<typeof setTimeout> | undefined>(undefined)` — must include the `undefined` initial value to avoid TS2554.

### Amber Light-Leak Borders (Phase 23)
Border contract changed from `border-white/[0.06]` → `border-[#e0743a]/10` on:
- SpaceShell desktop header, aside panels, mobile header + tabs
- FloatingNav inset boxShadow: `rgba(224,116,58,0.12)`
- Site-shell scrolled nav border: `rgba(224,116,58,0.08)`
- Modal rings (Archive, Covenant, BaselineEntry): `ring-[#e0743a]/12`
Hairline content separators (`border-b border-white/[0.08]`) in list rows remain white.

### Action Button Physics (Phase 23–24)
All glass action buttons: `active:scale-[0.97] active:duration-0 duration-[250ms]`
Submit button inner-glow: `0 0 0 1px rgba(224,116,58,0.22) inset, 0 0 14px rgba(224,116,58,0.07)` when active.
Button base class tracking bumped: `tracking-[0.16em]` (was 0.12em).

### Padding Increase (Phase 24)
SpaceShell main content: `p-8 lg:p-12` (was `p-6 lg:p-8`).

### Depth Gradients (Phase 24)
SpaceShell backgrounds changed from flat hex to `linear-gradient`:
- Main: `linear-gradient(170deg, #08070a 0%, #0a090d 100%)`
- Asides: `linear-gradient(180deg, #0c0a0d 0%, #09080b 100%)`

### Route Transitions (Phase 24)
PageTransition: push variant gains `y: 8→0` float-in; crossfade gains `y: 6→0`. Both maintain existing x and scale physics.

## Phase 22 — Design Token System
Central token file: `src/lib/design-tokens.ts`. Exports: `surface`, `accent`, `text`, `shape`, `physics`, `font`, `glassActionButton`, `creamCta`, `amberCta`.
Palette rules:
- Approved colors ONLY: #08070a, #0c0a0d, #f4efe9, #e0743a, #a8a29a, #76716b, #4f4b47, #d4cec8 — no #f0a06a, #c8c2bc, #e8e2da
- button.tsx uses CVA (exports `buttonVariants` for alert-dialog/calendar/pagination compat) — `rounded-2xl` slab for all solid variants, `rounded-xl` for ghost; hover is opacity-based, no fill transitions
- FloatingNav and site header: identical surface `rgba(8,7,10,0.82)` + `blur(24px)` — no saturate
- All modals (ArchiveDetail, CovenantDetail, BaselineEntry): `rounded-3xl` + `rgba(8,7,10,0.95)` + `blur(24px)` + `ring-1 ring-inset ring-white/[0.06]`
- All list rows (Archive, Covenant): `text-[14px] text-[#d4cec8]` + `border-b border-white/[0.08]`
- Inputs (Defrag, Covenant): text-[#f4efe9], bg-transparent
- `--accent` CSS variable in index.css: #a8a29a (updated from #c8c2bc)

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
