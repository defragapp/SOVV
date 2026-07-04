---
name: Sovereign.os design system rules
description: Color, border, and shape conventions enforced across the full app. Prevents drift between sessions.
---

## Amber rule
Amber (#e0743a) signals **intent** — active states, pulsing status dots, the active space switcher pill, focus warmth on the drop-zone hairline, "Your Response" label in Alignment. It does NOT mark structure.

**What to use for structural borders and hairlines:**
- `border-white/[0.055]` — standard hairline (header, sidebar, dividers)
- `bg-white/[0.055]` or `bg-white/[0.05]` — separator lines (between diagnostic cards, skeleton rows)

**Why:** Every structural element getting an amber tint made the amber signal meaningless and added visual heat in the wrong places.

## Button radius rule
All **action buttons** (submit, commit, seal, save, map, sign in) use `rounded-full`.
All **container cards/panels** (glass cards, overlays, nav pills) use `rounded-2xl` or smaller.
`rounded-3xl` is only used for the login card and similar large-radius iOS containers.

**How to apply:** If an element triggers an action → `rounded-full`. If it's a containing surface → `rounded-2xl` or below.

## Space shell borders
`space-shell.tsx` structural dividers (header border-b, left sidebar border-r, right panel border-l, mobile tab row border-b, mobile header border-b) all use `border-white/[0.055]` — neutral, not amber. Sidebar background is flat `#0c0a0d`.

## FloatingNav
The pill's inset ring is `rgba(255,255,255,0.07)` — neutral glass, not amber.

## MotionLink (motion-button.tsx)
`MotionLink` was removed — `motion(Link)` from wouter does not support ref forwarding cleanly in TypeScript and the component was unused. `MotionButton` remains (wraps `motion.button` with forwardRef).

## src/data/marketing.ts
Created to hold `PRICING_CONFIG` (price, period, priceId via `VITE_STRIPE_PRO_PRICE_ID`). Required by `upgrade-banner.tsx`.
