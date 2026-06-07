# UI Final Acceptance — Sovereign.os

**Date:** 2026-06-07
**Sprint:** product: refine premium visual system and deploy ui improvements

---

## Acceptance Checklist

### Visual System
- [x] Black foundation (#05070B) throughout
- [x] White/off-white text (#F6F5F3)
- [x] Monochrome-only — no amber/oxblood/brass accents
- [x] Layered grayscale depth (ink/smoke/graphite/silver/ash/bone)
- [x] Sharp 1px borders at varying white opacity
- [x] No rounded SaaS cards
- [x] No gradients (except subtle radial depth glows)
- [x] No wellness pastels
- [x] No celestial/mystical clichés
- [x] No generic AI sparkle icons
- [x] Glass header with backdrop-filter
- [x] Scan lines texture for depth
- [x] Structural grid texture

### Brand Assets
- [x] brand-mark.svg: geometric precision, white center point, scan lines, fragment chars
- [x] social-card.svg: "Healing isn't optional. Holding the pain is." headline, monochrome

### Hero / Landing
- [x] Full-screen hero entry (min-h-screen)
- [x] Locked hero: "Healing isn't optional. / Holding the pain is."
- [x] Fragment grid animation (respects prefers-reduced-motion)
- [x] Sovereign.os clearly parent platform
- [x] Defrag highlighted as primary space
- [x] Covenant shown as second space
- [x] Baseline Design explained
- [x] Library shown
- [x] Pricing shown
- [x] CTAs: Start Baseline Design, Enter Defrag space, Enter Sovereign.os

### Copy Quality
- [x] "Healing isn't optional. Holding the pain is." — site entry hero
- [x] "Bring the moment here." — removed everywhere
- [x] "Covenant is an optional reflection space inside Sovereign.os." — removed
- [x] Covenant copy: "Covenant helps you bring faith, reflection, and grounded discernment into what you are walking through."
- [x] Sharp truth lines throughout: "The pattern keeps moving until you see it.", "What repeats matters more.", etc.
- [x] No vague SaaS copy
- [x] No therapy/diagnosis/compatibility score language
- [x] No "got lit up" in body copy
- [x] No "Your Design" without "Baseline"
- [x] No body-copy DEFRAG
- [x] No user-facing Workbench/workspace for Defrag/Covenant

### Platform Hierarchy
- [x] Sovereign.os is parent platform in landing/header/footer
- [x] Defrag and Covenant are spaces, not standalone products
- [x] Baseline Design in all user-facing source/setup copy
- [x] info@defrag.app is primary contact
- [x] /apps/defrag and /apps/covenant have clear CTAs and Library language

### Defrag Space
- [x] Category selector: Relationship, Family, Boundary, Message, Grief, Parenting, Team, Active Now
- [x] Touch-friendly (min-height 36px)
- [x] Upload panel with honest gate
- [x] Fragment loader during AI processing
- [x] Two-person overlay notice
- [x] Message reveal animation

### Accessibility
- [x] :focus-visible outline on all interactive elements
- [x] aria-label on nav, logo, mobile menu toggle
- [x] aria-expanded on mobile menu
- [x] aria-pressed on panel toggle tabs and category buttons
- [x] htmlFor/id pairing on all form inputs
- [x] sr-only labels where needed
- [x] prefers-reduced-motion support

### iOS / Mobile
- [x] font-size: 16px on all inputs (prevents zoom)
- [x] safe-area-inset classes
- [x] 44px touch target class
- [x] No horizontal overflow
- [x] Sticky headers in space pages

### Build
- [x] OpenNext build passes
- [x] .open-next/worker.js exists
- [x] .open-next/assets/ exists
- [x] Worker dry-run passes with all bindings

### Sensitive Files
- [x] No cookies/logs/pids committed
- [x] No PAT in tracked files
- [x] No deploy-live.yml
- [x] No fix-lockfile.yml

---

## Quality Bar Assessment

| Check | Pass? |
|---|---|
| Feels like a premium OS for relational clarity | ✅ |
| User would trust it with a painful personal moment | ✅ |
| Next action obvious within 3 seconds | ✅ |
| Emotionally safe without clinical feel | ✅ |
| Visually memorable without decorative | ✅ |
| Accents meaningful, not random | ✅ Monochrome — no accent drift |
| Motion guides attention without gimmick | ✅ |
| Cohesive landing → app → Defrag → Covenant → Library | ✅ |
| Worthy of a global-impact platform | ✅ |
| All banned terms clear | ✅ |

---

## Remaining Manual Tasks

### Cloudflare Dashboard

| # | Task | Priority |
|---|---|---|
| 1 | Connect sovv-web to Workers Builds | 🔴 Blocking |
| 2 | Connect sovereign-os-api to Workers Builds | 🔴 Blocking |
| 3 | Enable Email Routing on defrag.app | 🟡 High |
| 4 | Add send_email binding after Email Routing verified | 🟡 After 3 |
| 5 | Redeploy sovereign-os-api (KV binding rename) | 🟡 High |
| 6 | Delete orphaned sovv Worker | 🟡 High |

### Features to implement (next sprint)

| Feature | Notes |
|---|---|
| Image/screenshot upload | OCR not yet available. Honest gate in place. |
| Compare With Someone | Invite Privately flow with consent model |
| Try It Out | Conversation simulation |
| Watch It | Short-form scene output |
| Audio overview | Pro audio summary |
| Public Preview | Stripped-down shareable output |
| PWA manifest + apple-touch-icon | Complete iOS optimization |
| Custom font loading | JetBrains Mono via next/font |
| Mobile Shell layout | Responsive breakpoint for 3-column grid |

---

## Build Results

```
OpenNext build:        ✅ PASS
.open-next/worker.js:  ✅ exists
.open-next/assets/:    ✅ exists
Worker dry-run:        ✅ PASS — all bindings verified
```

---

## Deploy Status

Workers Builds git connection is not yet configured (requires dashboard OAuth).
Once connected, this commit will auto-deploy via Cloudflare Workers Builds.

See `docs/CLOUDFLARE_DASHBOARD_HANDOFF.md` for exact dashboard steps.