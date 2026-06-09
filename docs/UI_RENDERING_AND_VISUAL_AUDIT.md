# UI Rendering & Visual Audit — Sovereign.os
**Date:** 2026-06-09  
**Auditor:** Office Agent (full static code audit)  
**Scope:** All public-facing and app surfaces in `apps/web/`  
**Method:** Full source read — every page, component, CSS, config, and asset file

---

## A. Executive Summary

The codebase is structurally sound and significantly more complete than a prototype. The design system in `globals.css` is well-constructed, the component architecture is clean, and the copy is on-tone. However, **several concrete bugs and inconsistencies are causing live visual failures** that prevent the platform from feeling premium and production-ready.

The most critical issues are:

1. **`layout.tsx` uses Tailwind token classes (`bg-background`, `text-foreground`) on `<body>` that may not resolve in production** — a regression from a prior fix that used inline hex values. If Tailwind's CSS variable resolution fails at the root level, the entire site renders on a white background with black text.
2. **`settings/page.tsx` uses a `glass` CSS class that does not exist** — only `surface-glass` is defined. The settings page header renders unstyled.
3. **Pricing page has a data/component field mismatch** — `pricing/page.tsx` reads `tier.popular` and `tier.interval` but `data/marketing.ts` exports `highlight` and `period`. The Pro tier card will not render its highlighted state or price interval correctly.
4. **`hub/page.tsx` and `tool/page.tsx` are completely unstyled legacy pages** — raw HTML with `border border-white` and `hover:bg-white hover:text-black` — no design system, no SiteShell, no brand. These are live routes.
5. **`hub/dashboard/page.tsx` is an unstyled prototype page** — same raw HTML pattern, live on `sovereign.defrag.app/hub/dashboard`.
6. **`tool/checkout/page.tsx` is an unstyled prototype checkout page** — raw `border border-white` layout, no design system.
7. **`accent-oxblood` CSS class is used in `apps/covenant/page.tsx` but is not defined anywhere** — silent no-op, but indicates a removed or never-implemented accent color system.
8. **Design direction conflict between `PLAN.md` and actual implementation** — `PLAN.md` specifies "Esoteric Brutalism: zero gradients, zero rounded corners, monospaced typography" but the implementation uses `rounded-2xl`, `backdrop-filter blur`, gradient cards, pill buttons, and Inter as the primary font. The implementation is the correct direction per the visual intent brief; `PLAN.md` is stale.
9. **Price inconsistency** — `data/marketing.ts` shows `$12/month` for Pro, but `UpgradeBanner.tsx` and `apps/covenant/page.tsx` both hardcode `$20/mo`. One of these is wrong.
10. **Nav link mismatch** — `site-shell.tsx` nav includes `/covenant` but `data/marketing.ts` `navItems` includes `/use-cases` and `/faq` instead. The footer in `site-shell.tsx` is also different from `data/marketing.ts` `footerItems`. Two competing nav definitions exist.

---

## B. Root Causes of Live Visual Failure

### B1. `layout.tsx` Token Regression (HIGH RISK)
**File:** `apps/web/app/layout.tsx`  
**Issue:** `<body className="... bg-background text-foreground ...">` uses Tailwind semantic tokens. In Tailwind v4 with `@tailwindcss/postcss`, the `tailwind.config.ts` file is **not automatically read** unless referenced via `@config` in the CSS file. `globals.css` has no `@config` directive. If the config is not being picked up, `bg-background` and `text-foreground` resolve to nothing, and the body renders white/black (browser default).

The prior fix report (2026-06-07) explicitly changed this to inline hex values (`style={{ background: "#05070B", color: "#F6F5F3" }}`). That fix has been **reverted** — the current `layout.tsx` is back to Tailwind tokens. This is the most likely cause of any live white-background rendering.

**Evidence:** `globals.css` uses `@tailwind base/components/utilities` (v3 syntax) with `@tailwindcss/postcss` (v4 plugin). No `@config "../../tailwind.config.ts"` directive exists. The Tailwind v4 CSS-first config system requires explicit `@config` to load a JS config file.

**Note:** It is possible the build pipeline is handling this correctly via Next.js's PostCSS integration, which may pass the config path automatically. This needs live verification. But the regression from the known-working inline-style fix is a red flag.

### B2. Missing CSS Classes (CONFIRMED)
- **`glass`** — used in `settings/page.tsx` header. Not defined in `globals.css`. Only `surface-glass` exists. The settings page header will render without backdrop blur or border.
- **`accent-oxblood`** — used twice in `apps/covenant/page.tsx`. Not defined anywhere. Silent no-op.
- **`bg-elevated`** — used in `pricing/page.tsx` as a Tailwind class (`bg-elevated`). Tailwind config maps `surface.hover` to `var(--bg-elevated)` but there is no `bg-elevated` shorthand. This may not apply the elevated background to the Pro pricing card.

### B3. Data/Component Field Mismatch (CONFIRMED BUG)
**File:** `apps/web/app/pricing/page.tsx` reads `tier.popular` and `tier.interval`  
**File:** `apps/web/data/marketing.ts` exports `highlight` (not `popular`) and `period` (not `interval`)  
**Result:** `tier.popular` is always `undefined` → Pro card never gets `border-focus glow-sm bg-elevated` classes → both cards look identical → no visual differentiation between Free and Pro tiers.

### B4. Unstyled Legacy Routes (CONFIRMED)
The following routes are live and completely outside the design system:
- `/hub` → `hub/page.tsx` — raw HTML, no SiteShell
- `/hub/dashboard` → `hub/dashboard/page.tsx` — raw HTML prototype
- `/tool` → `tool/page.tsx` — raw HTML, no SiteShell
- `/tool/checkout` → `tool/checkout/page.tsx` — raw HTML checkout

---

## C. Page-by-Page Audit Table

| Page | Route | Shell | Design System | Copy | Mobile | Issues |
|------|--------|-------|---------------|------|--------|--------|
| Landing | `/` | SiteShell ✅ | ✅ Good | ✅ Strong | ✅ | Hero visual placeholder (bars only); Covenant section has only a circle placeholder |
| About | `/about` | SiteShell ✅ | ✅ Good | ✅ Strong | ✅ | Minor: `font-mono uppercase tracking-widest` inline instead of `text-label` class |
| Product | `/product` | SiteShell ✅ | ✅ Good | ✅ Strong | ✅ | Clean |
| How It Works | `/how-it-works` | SiteShell ✅ | ✅ Good | ✅ Strong | ✅ | Step numbers use `text-display` at 30% opacity — visually heavy on mobile |
| Use Cases | `/use-cases` | SiteShell ✅ | ✅ Good | ✅ Strong | ✅ | Clean |
| Pricing | `/pricing` | SiteShell ✅ | ⚠️ Bug | ✅ Good | ✅ | **CRITICAL: `tier.popular`/`tier.interval` mismatch** — Pro card renders identically to Free; price interval missing |
| Login (redirect) | `/login` | None | N/A | N/A | N/A | Redirects to `/app/login` — correct |
| Contact | `/contact` | SiteShell ✅ | ⚠️ Mixed | ✅ Good | ✅ | Uses hardcoded `text-[#F6F5F3]/80` instead of design tokens; `STRIPE_SUPPORT_LINK_URL` env var renders "Support Defrag development" link which is confusing |
| Privacy | `/privacy` | SiteShell ✅ | ⚠️ Mixed | ✅ Good | ✅ | Uses `text-white/50` and `text-base font-light text-white` instead of design system classes |
| Terms | `/terms` | SiteShell ✅ | ⚠️ Mixed | ✅ Good | ✅ | Same as Privacy — raw Tailwind opacity classes instead of design tokens |
| Covenant (marketing) | `/covenant` | SiteShell ✅ | ✅ Good | ✅ Strong | ✅ | Clean |
| FAQ | `/faq` | SiteShell ✅ | ⚠️ Mixed | ✅ Good | ✅ | `FaqAccordion` uses `text-white/80`, `text-white/50` — not design tokens |
| Principles | `/principles` | SiteShell ✅ | ⚠️ Mixed | ✅ Strong | ✅ | Uses `text-lg font-light text-white`, `text-sm leading-7 text-white/45` — not design tokens |
| App Login | `/app/login` | None (LoginScreen) | ✅ Good | ✅ Good | ✅ | Clean; Turnstile warning shown if key not configured |
| Defrag Space | `/apps/defrag` | Shell ✅ | ✅ Good | ✅ Good | ⚠️ | **3-column grid is desktop-only** — no mobile layout; collapses to unusable on iPhone |
| Covenant Space | `/apps/covenant` | Custom header | ⚠️ Mixed | ✅ Good | ✅ | `accent-oxblood` undefined; `$20/mo` price hardcoded (conflicts with `$12` in data) |
| Settings | `/settings` | Custom header | ⚠️ Bug | ✅ Good | ✅ | **`glass` class undefined** — header renders unstyled; uses `border-[#F6F5F3]/8` (non-standard opacity) |
| Workspace (redirect) | `/workspace` | None | N/A | N/A | N/A | Redirects to `/apps/defrag` — correct |
| App (redirect) | `/app` | AuthGuard | N/A | N/A | N/A | Redirects to `/apps/defrag` — correct |
| Hub Landing | `/hub` | **NONE** | ❌ Broken | ❌ Off-brand | ❌ | **Completely unstyled** — raw HTML, no design system |
| Hub Dashboard | `/hub/dashboard` | **NONE** | ❌ Broken | ❌ Off-brand | ❌ | **Completely unstyled** — raw HTML prototype |
| Tool Landing | `/tool` | **NONE** | ❌ Broken | ❌ Off-brand | ❌ | **Completely unstyled** — raw HTML, no design system |
| Tool Checkout | `/tool/checkout` | **NONE** | ❌ Broken | ❌ Off-brand | ❌ | **Completely unstyled** — raw HTML checkout |
| Admin | `/admin` | SiteShell ✅ | ⚠️ Mixed | N/A | ✅ | Uses `rounded-3xl`, `text-4xl font-semibold` — not design tokens; functional but visually inconsistent |

---

## D. Global Design System Issues

### D1. Tailwind v4 Config Loading (CRITICAL — NEEDS VERIFICATION)
- `postcss.config.mjs` uses `@tailwindcss/postcss` (v4 plugin)
- `globals.css` uses `@tailwind base/components/utilities` (v3 directive syntax)
- `tailwind.config.ts` exists with full token definitions
- **No `@config` directive in `globals.css`** — in Tailwind v4, JS config files must be explicitly referenced
- **Risk:** Custom tokens (`background`, `foreground`, `surface`, `border`, `brand`, font families, shadows, easing functions) may not be available as Tailwind utility classes
- **Mitigation present:** All critical visual properties are also defined as CSS custom properties in `:root` and used directly in `globals.css` component classes — so `.btn-primary`, `.card`, `.text-display` etc. will render correctly regardless
- **Remaining risk:** Tailwind utility classes like `bg-background`, `text-foreground`, `bg-surface`, `border-border`, `font-sans`, `font-mono`, `shadow-glow` may not work

### D2. Duplicate CSS Class Definitions (BLOAT)
`globals.css` defines the same visual pattern three times under different names:
- `.card` = `.sovv-card` = `.premium-card` (identical gradient card)
- `.card-flat` = `.sovv-panel` (identical flat surface)
- `.btn-primary` = `.sovv-button-primary` (identical pill button)
- `.btn-secondary` = `.sovv-button` = `.btn-premium` (identical ghost button)

This is legacy mapping bloat. The codebase uses both naming systems inconsistently across pages.

### D3. Inconsistent Token Usage Across Pages
Some pages use design system classes; others use raw Tailwind opacity utilities:

| Pattern | Design System | Raw (inconsistent) |
|---------|--------------|-------------------|
| Body text | `text-body text-foreground-muted` | `text-sm leading-7 text-white/45` |
| Caption | `text-caption` | `text-xs text-white/50` |
| Labels | `text-label` | `font-mono text-[10px] uppercase tracking-widest text-white/30` |
| Micro | `text-micro` | `font-mono text-[9px] uppercase tracking-widest text-white/25` |

Pages using raw utilities: `privacy`, `terms`, `principles`, `faq`, `contact`, `settings`, `apps/covenant`, workspace components (`ContextPanel`, `Thread`, `Sidebar`, `BaselineEntry`, `UpgradeBanner`).

### D4. Missing `glass` Class
`settings/page.tsx` uses `className="... glass sticky top-0 z-40"`. The class `glass` is not defined in `globals.css`. Only `surface-glass` exists. The settings header will render without backdrop blur, background, or border styling.

### D5. Missing `accent-oxblood` Class
Used twice in `apps/covenant/page.tsx`. Not defined anywhere in the codebase. This was likely a planned accent color for the Covenant space that was never implemented. Currently a silent no-op.

### D6. `bg-elevated` Tailwind Class
`pricing/page.tsx` uses `bg-elevated` as a Tailwind utility. The Tailwind config maps `surface.hover` to `var(--bg-elevated)` but there is no `bg-elevated` shorthand key. The correct class would be `bg-surface-hover`. This means the Pro pricing card's elevated background may not apply.

### D7. Nav Definition Conflict
Two competing nav definitions exist:
- `site-shell.tsx` NAV_LINKS: `Product`, `How it works`, `Pricing`, `Covenant`
- `data/marketing.ts` navItems: `Product`, `How It Works`, `Use Cases`, `Pricing`, `FAQ`

The site-shell is what actually renders. `data/marketing.ts` navItems are unused. The footer in `site-shell.tsx` also differs from `data/marketing.ts` footerItems. This creates confusion about the canonical nav structure.

### D8. PLAN.md Design Direction Conflict
`PLAN.md` specifies "Esoteric Brutalism: Pure black backgrounds, 1px white borders, monospaced typography, zero gradients, zero rounded corners." The actual implementation uses `rounded-2xl`, `backdrop-filter blur`, gradient cards, pill buttons (`border-radius: 999px`), and Inter as the primary font. The implementation matches the visual intent brief (premium, cinematic, restrained) and is the correct direction. `PLAN.md` is stale and should be updated to reflect the actual design system.

---

## E. Mobile / iOS Issues

### E1. Defrag Space — No Mobile Layout (CRITICAL)
**File:** `components/workspace/Shell.tsx`  
The main app shell uses a fixed 3-column grid: `grid-cols-[220px_1fr_280px]`. There is no responsive breakpoint. On mobile (iPhone), this renders as a 500px+ wide layout that overflows horizontally, making the app completely unusable on mobile.

**Impact:** Any user who opens `app.defrag.app` on iPhone sees a broken, horizontally-scrolling layout.

**Required fix:** Add a mobile-first layout that collapses to a single-column view with tab navigation between Sidebar, Thread, and ContextPanel.

### E2. Category Chips in Thread — Horizontal Scroll
**File:** `components/workspace/Thread.tsx`  
Category selector uses `overflow-x-auto scrollbar-none` — this works but has no visual affordance that it scrolls. On iPhone, users may not discover the full category list.

### E3. Safe Area — Partial Implementation
- `layout.tsx` applies `safe-top safe-bottom` to `<body>` ✅
- `Shell.tsx` header applies `safe-top` ✅
- `Covenant` page header applies `safe-top` ✅
- `settings/page.tsx` header does NOT apply `safe-top` — the header may clip under the iPhone notch/Dynamic Island

### E4. Input Font Size — Correctly Handled
All inputs use `style={{ fontSize: "16px" }}` or `font-size: 16px` to prevent iOS zoom. ✅

### E5. Touch Targets — Mostly Correct
Category chips use `min-h-[36px]` (slightly under 44px minimum). Most buttons meet the 44px standard via `touch-target` class or adequate padding.

### E6. `userScalable: false` in Viewport
`layout.tsx` sets `maximumScale: 1, userScalable: false`. This prevents pinch-to-zoom across the entire site, which is an accessibility concern (WCAG 1.4.4). Consider removing this restriction from marketing pages and only applying it to the app shell.

---

## F. Functional Surface Issues

### F1. Pricing Card — Pro Tier Not Visually Distinguished
Due to the `tier.popular` vs `tier.highlight` field mismatch, the Pro pricing card renders identically to the Free card. No badge, no glow, no elevated background. Users cannot visually identify which tier is recommended.

### F2. Price Inconsistency — $12 vs $20
- `data/marketing.ts` Pro price: `$12/month`
- `UpgradeBanner.tsx`: `"Upgrade to Pro — $20/mo"`
- `apps/covenant/page.tsx`: `"Upgrade to Pro — $20/mo"`

One of these is wrong. The pricing page shows `$12` (from `data/marketing.ts`). The upgrade flow shows `$20`. This creates a trust-breaking inconsistency at the moment of conversion.

### F3. Upload UI — Honest Gate Present
The image upload UI in `Thread.tsx` correctly shows "Image review not yet available" and disables the input. This is honest and acceptable. ✅

### F4. Defrag Space — Pro Gate Logic
`apps/defrag/page.tsx` gates on `tier === "pro" || subscription_status === "active"`. Free users see `UpgradeBanner` immediately. This means **free tier users cannot access Defrag at all**, despite the pricing page listing "Defrag space access" as a Free feature. This is either a product decision or a bug.

### F5. Covenant Space — Dual Gate
`apps/covenant/page.tsx` has its own auth check (redirects to `/app/login` on 401) AND a Pro gate within the page. This is correct but the Pro gate UI uses a custom inline button style rather than `btn-primary`, creating visual inconsistency.

### F6. Settings Page — No Auth Guard
`settings/page.tsx` does not use `AuthGuard` or check session. It calls `apiGetBaseline()` which will fail silently if unauthenticated. The page renders but the form will not load existing data. The header links to `/apps/defrag` which will redirect to login — so the flow is recoverable, but the settings page itself is accessible without auth.

### F7. Library (YourSpace) — Placeholder Sections
`YourSpace.tsx` renders "Best Next Responses", "Covenant Briefs", "Watch It", "Compare With Someone" as static labels with "Saves here" text. These are placeholder sections that suggest functionality not yet implemented. They appear in the live app.

### F8. Sidebar — Empty State
`Sidebar.tsx` fetches from `/api/auth/people` but the API endpoint is not listed in the worker routes. If this endpoint doesn't exist, the sidebar shows only the "Self" section with no people. No empty state message is shown for the People section.

### F9. Hub Dashboard — Broken Auth
`hub/dashboard/page.tsx` calls `getSession()` from `@/lib/auth` which is a client-side utility. The page is a client component but uses `getSession()` which may not work correctly in the app shell context. The page also redirects to `/auth` (not `/app/login`) which doesn't exist as a route.

---

## G. Copy / Messaging Weak Points

### G1. "Healing" in Product Copy — Contradicts Language Standard
`docs/05_PRODUCT_LANGUAGE.md` lists `healing` as a **forbidden term** in product copy: "avoid in product copy." However, the canonical hero line is "Healing isn't optional. Holding the pain is." — and this appears on the landing page, about page, use-cases page, and how-it-works page.

This is a documented internal contradiction. The language standard doc needs to be updated to exempt the canonical hero line, or the hero line needs to change.

### G2. Contact Page — "Support Defrag development" Link
`contact/page.tsx` renders a link labeled "Support Defrag development →" when `STRIPE_SUPPORT_LINK_URL` env var is set. This is confusing on a contact page — it reads like a donation link. The label and placement need reconsideration.

### G3. Pricing Page — Feature List Uses "/" as Bullet
Features are listed with `<span>/</span>` as the bullet character. This is a stylistic choice but reads oddly — "/" typically implies "or" or a path separator. Consider `—` or a dot `·` for cleaner visual parsing.

### G4. UpgradeBanner — "Workbench" Terminology
`UpgradeBanner.tsx` reads: "An active subscription is required to use the Defrag workbench." The word "workbench" is explicitly forbidden per `docs/05_PRODUCT_LANGUAGE.md`. Should be "Defrag space."

### G5. BaselineEntry — "Sovereign OS" vs "Sovereign.os"
`BaselineEntry.tsx` header reads "Sovereign OS" (without the dot). The canonical name is "Sovereign.os". Minor but inconsistent.

### G6. Hub/Page — Off-Brand Copy
`hub/page.tsx` uses "Your private platform for relational intelligence." — generic SaaS phrasing. Not aligned with the platform's emotional directness.

### G7. Thread Empty State — Very Low Contrast
`Thread.tsx` empty state: `text-[#F6F5F3]/18` — 18% opacity white on near-black. This is essentially invisible. The prompt "Start with what is happening now." is the most important onboarding message in the app and it's nearly unreadable.

### G8. Pricing — "interval" Field Missing
Due to the `tier.interval` vs `tier.period` mismatch, the price interval (`/ month`) does not render on the pricing cards. Users see `$12` with no period indicator.

---

## H. Missing or Low-Quality Visual Assets

### H1. Hero Visual Placeholders — Landing Page
The landing page has three "visual" sections that are placeholder mockups:
1. **Baseline Design section** — shows three horizontal bars (`w-16 h-1`, `w-8 h-1`, `w-24 h-1`) with "Baseline Active" label. This is a placeholder, not a real visual.
2. **Defrag section** — shows two empty rounded rectangles (`w-full h-12 rounded-xl border`). Placeholder.
3. **Covenant section** — shows a single empty circle (`w-16 h-16 rounded-full border`). Placeholder.

These three sections occupy significant vertical space on the landing page and communicate nothing about the product. They need real UI mockups, screenshots, or purposeful abstract visuals.

### H2. Brand Mark — Functional but Generic
`public/brand-mark.svg` is a geometric SVG with concentric circles, axis lines, and a center dot. It is clean and on-brand. However, it is used as both the favicon and the Apple touch icon — SVG favicons have inconsistent browser support (not supported in Safari). A PNG fallback at 192×192 and 512×512 is missing.

### H3. Social Card — Text Rendering Risk
`public/social-card.svg` embeds text using `font-family="'SF Pro Display', Inter, ui-sans-serif..."`. SVG text with system fonts does not render consistently across Open Graph scrapers (Twitter, LinkedIn, Slack). The headline "Healing isn't optional." may render in a fallback font or fail entirely. A PNG version of the social card is strongly recommended.

### H4. Apple Touch Icon — SVG Only
`manifest.json` and `layout.tsx` both reference `/brand-mark.svg` as the Apple touch icon. iOS requires PNG for home screen icons. SVG is not supported as an Apple touch icon. The icon will fall back to a screenshot or generic icon on iOS home screen.

### H5. No Favicon ICO
No `favicon.ico` exists in `public/`. Only `brand-mark.svg` is referenced. Older browsers and some email clients require `.ico` format.

### H6. No OG Image PNG
Open Graph `images: ["/social-card.svg"]` — SVG is not supported by most OG scrapers. Twitter, Facebook, LinkedIn, and iMessage all require PNG or JPEG for preview images. The social card will not render in link previews.

---

## I. Priority Order for Fixes

### 🔴 Blocking Visual Bugs (Fix First)

| # | Issue | File | Impact |
|---|-------|------|--------|
| 1 | `layout.tsx` — revert to inline hex values for `bg`/`color` on `<body>` | `app/layout.tsx` | Site-wide white background risk |
| 2 | Pricing data mismatch — rename `highlight`→`popular`, `period`→`interval` in `data/marketing.ts` | `data/marketing.ts` | Pro card invisible, price interval missing |
| 3 | `glass` class missing — replace with `surface-glass` in settings header | `app/settings/page.tsx` | Settings header unstyled |
| 4 | `bg-elevated` Tailwind class — replace with `bg-[var(--bg-elevated)]` or `bg-surface-hover` | `app/pricing/page.tsx` | Pro card background missing |
| 5 | Price inconsistency — align `$20` in UpgradeBanner and Covenant to match `$12` in data (or vice versa) | `UpgradeBanner.tsx`, `apps/covenant/page.tsx` | Trust-breaking at conversion |

### 🟠 Structural Layout Fixes

| # | Issue | File | Impact |
|---|-------|------|--------|
| 6 | Defrag Shell — add mobile responsive layout | `components/workspace/Shell.tsx` | App unusable on iPhone |
| 7 | Hub pages — wrap in SiteShell or redirect to canonical routes | `app/hub/page.tsx`, `app/hub/dashboard/page.tsx` | Unstyled live routes |
| 8 | Tool pages — wrap in SiteShell or redirect to canonical routes | `app/tool/page.tsx`, `app/tool/checkout/page.tsx` | Unstyled live routes |
| 9 | Settings header — add `safe-top` class | `app/settings/page.tsx` | Notch clipping on iPhone |

### 🟡 Hierarchy / Spacing / Token Fixes

| # | Issue | Files | Impact |
|---|-------|-------|--------|
| 10 | Replace raw opacity utilities with design tokens | `privacy`, `terms`, `principles`, `faq`, `contact`, `settings`, workspace components | Visual inconsistency |
| 11 | Remove duplicate CSS class definitions | `globals.css` | Bloat, confusion |
| 12 | Add `@config` directive to `globals.css` or verify Tailwind v4 config loading | `globals.css` | Token resolution risk |
| 13 | Consolidate nav definitions — remove `data/marketing.ts` navItems or sync with site-shell | `data/marketing.ts`, `site-shell.tsx` | Confusion, drift |
| 14 | Thread empty state — increase opacity from `/18` to `/40` minimum | `components/workspace/Thread.tsx` | Onboarding message invisible |

### 🟢 Copy / Value Fixes

| # | Issue | File | Impact |
|---|-------|------|--------|
| 15 | Fix "Workbench" → "Defrag space" in UpgradeBanner | `UpgradeBanner.tsx` | Language standard violation |
| 16 | Fix "Sovereign OS" → "Sovereign.os" in BaselineEntry | `BaselineEntry.tsx` | Brand inconsistency |
| 17 | Clarify or remove "Support Defrag development" link on contact page | `app/contact/page.tsx` | Confusing UX |
| 18 | Update `PLAN.md` design direction to match actual implementation | `PLAN.md` | Agent confusion |
| 19 | Resolve "healing" forbidden-term contradiction in language standard | `docs/05_PRODUCT_LANGUAGE.md` | Internal doc conflict |
| 20 | Replace "/" bullet with `—` or `·` in pricing feature list | `app/pricing/page.tsx` | Minor readability |

### 🔵 Visual Asset Upgrades

| # | Issue | Impact |
|---|-------|--------|
| 21 | Replace landing page placeholder visuals (bars, rectangles, circle) with real UI mockups | Premium feel, product clarity |
| 22 | Generate PNG versions of brand-mark at 192×192 and 512×512 | iOS home screen, favicon fallback |
| 23 | Generate PNG version of social-card (1200×630) | OG previews on all platforms |
| 24 | Add `favicon.ico` | Browser tab compatibility |
| 25 | Update `manifest.json` and `layout.tsx` to reference PNG icons | iOS PWA install |

### ⚪ Motion Polish

| # | Issue | Impact |
|---|-------|--------|
| 26 | Add page transition wrapper for marketing pages | Cinematic feel between routes |
| 27 | Add `accent-oxblood` color definition for Covenant space differentiation | Covenant visual identity |
| 28 | Consider subtle entrance animation for Defrag Shell panels | App feel premium |

---

## J. Recommended Implementation Order

### Pass 1 — Blocking Fixes (1–2 hours)
1. Fix `layout.tsx` — inline hex values on `<body>` (revert to known-working state)
2. Fix `data/marketing.ts` — rename `highlight`→`popular`, `period`→`interval`
3. Fix `settings/page.tsx` — replace `glass` with `surface-glass`
4. Fix `pricing/page.tsx` — replace `bg-elevated` with `bg-[var(--bg-elevated)]`
5. Align price — decide $12 or $20, update all three locations

### Pass 2 — Structural (2–4 hours)
6. Add mobile layout to `Shell.tsx` (single column with tab nav on mobile)
7. Redirect or wrap `/hub` and `/tool` routes in SiteShell
8. Add `safe-top` to settings header

### Pass 3 — Token Consistency (2–3 hours)
9. Audit all pages using raw opacity utilities, replace with design tokens
10. Remove duplicate CSS class definitions from `globals.css`
11. Add `@config` directive to `globals.css` (or verify build handles it)
12. Consolidate nav to single source of truth

### Pass 4 — Copy & Language (1 hour)
13. Fix "Workbench", "Sovereign OS", contact page link
14. Update `PLAN.md` and language standard doc

### Pass 5 — Visual Assets (2–4 hours)
15. Replace landing page placeholder visuals
16. Generate PNG icons and social card
17. Update manifest and layout icon references

### Pass 6 — Polish (ongoing)
18. Page transitions
19. Covenant accent color
20. Shell entrance animations

---

## Summary Answers

### Top 10 Most Urgent Issues

1. **`layout.tsx` regression** — `bg-background`/`text-foreground` on `<body>` may cause white-background rendering (reverted from known-working inline fix)
2. **Pricing data mismatch** — `tier.popular`/`tier.interval` undefined → Pro card invisible, price missing
3. **`glass` class missing** — settings page header renders unstyled
4. **Price inconsistency** — `$12` on pricing page vs `$20` in upgrade flow
5. **Defrag Shell no mobile layout** — app unusable on iPhone
6. **`/hub` and `/tool` routes unstyled** — live pages completely outside design system
7. **`bg-elevated` Tailwind class** — Pro card elevated background may not apply
8. **`accent-oxblood` undefined** — Covenant space accent color missing
9. **Thread empty state near-invisible** — `text-[#F6F5F3]/18` is essentially unreadable
10. **SVG-only social card and icons** — OG previews broken on all platforms, iOS home screen icon broken

### Root Cause Hypotheses

1. **Regression pattern** — fixes are being applied and then reverted (layout.tsx inline styles → Tailwind tokens). Suggests multiple agents or developers making conflicting changes without a locked standard.
2. **Two-track development** — some components use the design system (`globals.css` classes), others use raw Tailwind utilities. Suggests the design system was built after some components were written and not fully backfilled.
3. **Data/component drift** — `data/marketing.ts` and `pricing/page.tsx` were edited independently without cross-checking field names.
4. **Legacy route accumulation** — `/hub`, `/tool`, `/hub/dashboard`, `/tool/checkout` are remnants of a prior routing architecture that were never cleaned up or redirected.

### Files Most Likely Causing Live Broken Rendering

1. `apps/web/app/layout.tsx` — root body token classes
2. `apps/web/app/pricing/page.tsx` — field name mismatch
3. `apps/web/app/settings/page.tsx` — missing `glass` class
4. `apps/web/app/hub/page.tsx` — completely unstyled
5. `apps/web/app/tool/page.tsx` — completely unstyled
6. `apps/web/components/workspace/Shell.tsx` — no mobile layout

### Pages Needing Full Restructure vs Lighter Cleanup

**Full restructure required:**
- `app/hub/page.tsx` — needs SiteShell or permanent redirect
- `app/hub/dashboard/page.tsx` — needs SiteShell or permanent redirect
- `app/tool/page.tsx` — needs SiteShell or permanent redirect
- `app/tool/checkout/page.tsx` — needs SiteShell or permanent redirect
- `components/workspace/Shell.tsx` — needs mobile-responsive layout

**Lighter cleanup (token/class fixes only):**
- `app/pricing/page.tsx` — field name fix + `bg-elevated` fix
- `app/settings/page.tsx` — `glass` → `surface-glass`, add `safe-top`
- `app/privacy/page.tsx` — replace raw utilities with design tokens
- `app/terms/page.tsx` — replace raw utilities with design tokens
- `app/principles/page.tsx` — replace raw utilities with design tokens
- `app/faq/page.tsx` — replace raw utilities with design tokens
- `app/contact/page.tsx` — replace raw utilities with design tokens
- `app/apps/covenant/page.tsx` — fix `accent-oxblood`, fix price
- `components/workspace/UpgradeBanner.tsx` — fix "Workbench", fix price
- `components/workspace/BaselineEntry.tsx` — fix "Sovereign OS"
- `components/workspace/Thread.tsx` — fix empty state opacity

### Is a Second Implementation Pass Recommended?

**Yes.** Pass 1 (blocking fixes) can be done immediately and is small. Pass 2 (mobile Shell layout) is the most impactful structural work and should be prioritized before any marketing or copy work. Passes 3–6 are cleanup and polish that can be done incrementally.

### Build Blockers Found

No hard build blockers were found in the source code. The `next.config.ts` has `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` for TypeScript and ESLint, so type errors will not block the build. The `data/marketing.ts` field mismatch is a runtime bug, not a build error. The missing CSS classes are silent no-ops at build time.

The Tailwind v4 / `@config` question is the only potential build-time concern, but since the CSS custom properties in `globals.css` cover all critical visual properties, the build will succeed even if the JS config is not loaded — the risk is only in Tailwind utility class resolution.