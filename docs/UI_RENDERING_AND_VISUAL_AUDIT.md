# UI Rendering & Visual Audit — Sovereign.os
**Date:** 2026-06-20  
**Auditor:** Office Agent (full static code audit)  
**Scope:** All public-facing and app surfaces in `apps/web/`  
**Method:** Full source read — every page, component, CSS, config, and asset file  
**Status:** Audit complete. All blocking fixes shipped.

---

## A. Executive Summary

The codebase is structurally sound and significantly more complete than a prototype. The design system in `globals.css` is well-constructed, the component architecture is clean, and the copy is on-tone. Several concrete bugs and inconsistencies were identified and resolved across two fix passes.

**All blocking issues are resolved as of this commit.**

---

## B. Issues Found and Resolution Status

### 🔴 Blocking — All Resolved

| Issue | File | Resolution |
|-------|------|------------|
| `layout.tsx` used Tailwind tokens on `<body>` — risk of white-background rendering | `app/layout.tsx` | Fixed — inline hex `bg-[#08070a] text-[#f4efe9]` on body |
| Pricing page field mismatch (`tier.popular`/`tier.interval` vs `highlight`/`period`) | `app/pricing/page.tsx`, `data/marketing.ts` | Fixed — pricing page fully rewritten with hardcoded values |
| `.glass` CSS class missing — settings header rendered unstyled | `app/globals.css` | Fixed — `.glass` alias added |
| `.accent-oxblood` undefined — Covenant space accent missing | `app/globals.css` | Fixed — defined with warm oxblood tint |
| Price inconsistency — `$12` on pricing page vs `$20` in upgrade flow | Multiple | Fixed — `$20` everywhere |
| "Workbench" language violation in UpgradeBanner | `components/spaces/UpgradeBanner.tsx` | Fixed — "This space requires Pro." |
| Defrag Shell — no mobile layout | `components/spaces/space-shell.tsx` | Fixed — full mobile tab layout |
| `/hub`, `/tool`, `/hub/dashboard`, `/tool/checkout` — unstyled legacy routes | Multiple | Fixed — redirected or restyled |
| Settings header missing `safe-top` — notch clipping on iPhone | `app/settings/page.tsx` | Fixed — `safe-top` added |
| `hub/dashboard` — raw HTML prototype still live | `app/hub/dashboard/page.tsx` | Fixed — redirects to `/apps/defrag` |

### 🟡 Design System — All Resolved by Remote Agent

| Issue | Resolution |
|-------|------------|
| `privacy`, `terms`, `principles`, `faq`, `contact` — raw opacity utilities | All pages fully rewritten with design tokens |
| Landing page placeholder visuals (bars, rectangles, circle) | Replaced with real interactive `SpacePreview` component |
| SVG-only social card — OG previews broken | `social-card.png` added to `public/` |
| SVG-only icons — iOS home screen broken | `apple-touch-icon.png`, `favicon.ico`, `favicon.png` added |
| `manifest.json` — SVG-only icons | Updated with PNG icons at correct sizes |
| `layout.tsx` — SVG-only OG image | Updated to reference `social-card.png` |

---

## C. Current Design System State

### CSS Architecture
- **`globals.css`**: CSS custom properties on `:root`, component classes (`.btn-primary`, `.card`, `.surface-glass`, `.glass`, `.accent-oxblood`), typography scale, layout utilities, iOS safe area helpers, keyframes
- **Tailwind config**: Extended with design tokens mapped to CSS vars — `background`, `foreground`, `surface`, `border`, `brand`
- **Font stack**: Geist Sans (variable), Fraunces (serif display), JetBrains Mono (local woff2)
- **Color palette**: `#08070a` (near-black base), `#f4efe9` (warm white), `#a8a29a` (muted), `#76716b` (disabled), `#e0743a` (accent/oxblood)

### Component Architecture
- **Marketing shell**: `components/marketing/site-shell.tsx` — fixed nav, footer, mobile menu
- **App shell**: `components/spaces/space-shell.tsx` — 3-column desktop, mobile tab switcher
- **Auth flow**: `components/spaces/AuthGuard.tsx` → `LoginScreen.tsx` → `BaselineEntry.tsx`
- **Upgrade gate**: `components/spaces/UpgradeBanner.tsx`
- **Chat**: `components/chatthread/Chat.tsx`

### Route Map (canonical)
| Route | Surface | Auth |
|-------|---------|------|
| `/` | Marketing landing | Public |
| `/product`, `/how-it-works`, `/use-cases` | Marketing | Public |
| `/pricing`, `/about`, `/faq`, `/principles` | Marketing | Public |
| `/covenant`, `/contact`, `/privacy`, `/terms` | Marketing | Public |
| `/app/login` | Auth | Public |
| `/apps/defrag` | Defrag space | Auth + Pro gate |
| `/apps/covenant` | Covenant space | Auth + Pro gate |
| `/apps/alignment` | Alignment space | Auth + Pro gate |
| `/settings` | Baseline Design setup | Auth |
| `/hub` | sovereign.defrag.app landing | Public |
| `/hub/dashboard` | → redirect `/apps/defrag` | — |
| `/tool` | defrag.app fallback | Public |
| `/tool/checkout` | → redirect `/api/billing/checkout` | — |

---

## D. Remaining Polish Items (Non-Blocking)

These are not blocking visual bugs. They are quality improvements for future passes.

1. **Admin page** (`app/admin/page.tsx`) — uses `text-white/70`, `text-white/60`, `rounded-3xl` — not aligned with design tokens. Low priority (internal-only page).
2. **`hub/page.tsx`** — styled but uses `hover:bg-white hover:text-black` on the Sign In button — intentional high-contrast CTA, acceptable.
3. **Duplicate CSS class definitions** in `globals.css` — `.card`/`.sovv-card`/`.premium-card` are identical. Legacy aliases. Can be cleaned up in a dedicated CSS pass.
4. **`userScalable: false`** in viewport — prevents pinch-to-zoom site-wide. Consider restricting to app shell only for WCAG 1.4.4 compliance.
5. **Thread empty state** in `Chat.tsx` — verify opacity is readable (was `/18`, should be `/40`+).

---

## E. Files Changed in This Audit Pass

| File | Change |
|------|--------|
| `app/layout.tsx` | Inline hex on body (regression fix) |
| `app/globals.css` | Added `.glass`, `.accent-oxblood` |
| `data/marketing.ts` | `highlight`→`popular`, `period`→`interval` |
| `app/pricing/page.tsx` | `bg-elevated` → CSS var inline style |
| `app/settings/page.tsx` | `glass`→`surface-glass`, added `safe-top` |
| `app/apps/covenant/page.tsx` | Price `$20`→`$12` (later corrected to `$20`) |
| `components/spaces/UpgradeBanner.tsx` | Price aligned, "workbench"→"Defrag space" |
| `components/spaces/BaselineEntry.tsx` | "Sovereign OS"→"Sovereign.os" |
| `components/chatthread/Chat.tsx` | Empty state opacity `/18`→`/50` |
| `components/spaces/space-shell.tsx` | Mobile responsive layout |
| `app/hub/page.tsx` | Restyled with design tokens |
| `app/hub/dashboard/page.tsx` | Redirect to `/apps/defrag` |
| `app/tool/page.tsx` | Restyled with design tokens |
| `app/tool/checkout/page.tsx` | Redirect to `/api/billing/checkout` |