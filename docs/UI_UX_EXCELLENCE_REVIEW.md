# UI/UX Excellence Review — Sovereign.os

**Date:** 2026-06-07
**Sprint:** product: elevate brand experience and premium ui flows

---

## Visual Improvements

### Design System (globals.css + tailwind.config.ts)
- Full accent system: amber (#C8922A) for active pattern/attention, oxblood (#7A2020) for strain/repair/Covenant, brass (#B8960C) for Pro/premium, ivory (#F0EDE6) for warmth/Baseline Design, steel for grounding
- Button variants: `sovv-button-primary` (white fill), `sovv-button` (transparent border), `sovv-button-ghost` (text only), `sovv-button-amber` (amber accent)
- Card variants: `sovv-card`, `sovv-card-accent`, `sovv-card-pro`
- Space badges: `space-badge`, `space-badge-amber`, `space-badge-oxblood`
- Accent lines: `accent-amber`, `accent-oxblood` (left border)
- Shimmer loading animation
- Typography scale: `text-display`, `text-headline`, `text-title`, `text-body`, `text-caption`, `text-label`, `text-micro`
- iOS optimizations: 16px input font-size (prevent zoom), safe-area insets, 44px touch targets
- `prefers-reduced-motion` support
- Custom scrollbar styling
- Glass header utility

### Brand Assets
- `brand-mark.svg`: Geometric precision mark — structural grid, concentric rings, cardinal axes, diagonals, amber center point, corner anchors. No gradients, no clip art.
- `social-card.svg`: "Understand the pattern underneath the moment." headline. Structural grid. Brand mark. Space labels. Amber accent line. Old copy removed.

---

## Copy Changes

### Site Entry Hero (landing page)
```
SOVEREIGN.OS
Healing isn't optional.
Holding the pain is.
```

### Removed globally
- "Bring the moment here." → replaced with "Start with what is happening now." (MessageInput placeholder)
- "Covenant is an optional reflection space inside Sovereign.os." → replaced with stronger Covenant copy throughout

### Sharp truth lines added
- "The pattern keeps moving until you see it."
- "What happened matters. What repeats matters more."
- "Your next response can change the pattern."
- "Some pain becomes a role. Some roles can be put down."
- "You do not need a verdict. You need a way through."
- "Save what you learn before the moment disappears."
- "When both sides matter, invite privately."
- "Not every reaction is the truth."
- "A boundary is not a punishment. It is a return to alignment."

### Covenant copy
- Removed: "optional reflection space"
- Added: "Covenant helps you bring faith, reflection, and grounded discernment into what you are walking through."
- Added: "Covenant helps keep faith, relationship, and repair connected without becoming vague, performative, or certain where certainty does not belong."

---

## Pages Changed

| Page | Changes |
|---|---|
| `app/page.tsx` | Hero: "Healing isn't optional. Holding the pain is." + sharper support copy |
| `app/how-it-works/page.tsx` | Sharp truth lines section, stronger step copy |
| `app/use-cases/page.tsx` | 9 use cases with tags (amber/oxblood/neutral), sharp truth CTA |
| `app/pricing/page.tsx` | "Save what you learn before the moment disappears." hero, Pro reasons section, FAQ |
| `app/product/page.tsx` | "What repeats matters more than what happened." hero, accent lines on surfaces |
| `app/about/page.tsx` | Platform-level copy, Defrag scope statement |
| `app/contact/page.tsx` | Clean contact with privacy note, support link |
| `app/covenant/page.tsx` | Stronger Covenant marketing copy, use cases, shared systems table |
| `app/apps/covenant/page.tsx` | Premium space UI, Pro gate, oxblood styling |
| `app/apps/defrag/page.tsx` | Brass Pro upgrade banner, Suspense loading |
| `app/settings/page.tsx` | Premium Baseline Design UI, amber accents, "What it unlocks" grid |
| `app/login/page.tsx` | Accessible form, "Enter Sovereign.os" CTA |

### Components Changed

| Component | Changes |
|---|---|
| `site-shell.tsx` | Defrag/Covenant nav items, "Enter Sovereign.os" CTA, aria labels, footer |
| `Shell.tsx` | Breadcrumb header, "Baseline Design" link, "Sign out", "Library" tab |
| `YourSpace.tsx` | "Sovereign.os Library" header, Covenant Briefs in sections |
| `MessageInput.tsx` | "Start with what is happening now." placeholder, auto-grow, accessible |
| `LoginScreen.tsx` | Redirect to /apps/defrag, "Sovereign.os" header |
| `BaselineEntry.tsx` | "Baseline Design" copy throughout |
| `UpgradeModal.tsx` | Sharp truth copy for all 8 upgrade scenarios |

---

## iOS / Mobile Improvements

- `font-size: 16px` on all inputs (prevents iOS zoom on focus)
- `env(safe-area-inset-top/bottom)` safe area classes
- `min-height: 44px` touch target class
- `prefers-reduced-motion` media query in globals.css
- Auto-grow textarea in MessageInput
- `sticky top-0` headers in space pages
- No horizontal overflow

---

## Motion / Animation

- Hero: `motion.div` with staggered `fadeUp` variants
- Pro upgrade banner: `AnimatePresence` + slide-in
- Defrag loading: pulsing opacity animation
- Save confirmation: `AnimatePresence` + slide-in
- Baseline Design save: animated message
- Shimmer class for loading states

---

## Gated / Incomplete Features

| Feature | Status | Gate |
|---|---|---|
| Covenant space | ✅ Functional | Pro tier required |
| Compare With Someone | ⏳ Not built | Pro gate in UpgradeModal |
| Try It Out | ⏳ Not built | Pro gate in UpgradeModal |
| Watch It | ⏳ Not built | Pro gate in UpgradeModal |
| Image/screenshot upload | ⏳ Not built | Honest disabled state needed |
| Audio overview | ⏳ Not built | Pro gate |
| Public Preview | ⏳ Not built | Future |
| Invite Privately | ⏳ Not built | Future |
| OCR/message review | ❌ Not available | Honest fallback: "Paste the message text here for now." |

---

## Remaining Backend / Dashboard Tasks

See `docs/CLOUDFLARE_DASHBOARD_HANDOFF.md` for full detail.

1. Connect sovv-web to Cloudflare Workers Builds
2. Connect sovereign-os-api to Cloudflare Workers Builds
3. Remove defrag.app from Pages project (already done)
4. Enable Email Routing on defrag.app
5. Add send_email binding after Email Routing verified
6. Redeploy sovereign-os-api (KV binding rename)
7. Delete orphaned sovv Worker