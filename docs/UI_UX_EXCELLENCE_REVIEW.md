# UI/UX Excellence Review — Sovereign.os

**Date:** 2026-06-07
**Sprint:** product: refine premium visual system and deploy ui improvements

---

## Visual Revisions

### Accent / Color Direction Change
**Previous:** amber (#C8922A), oxblood (#7A2020), brass (#B8960C) accent system
**Revised:** Monochrome-only system — black/white foundation, layered grayscale, glass/ink/smoke/silver/graphite depth

**Rationale:** Amber/red/orange/rust accents were not the desired visual direction. The platform should feel premium, editorial, and controlled — not warm-toned or wellness-adjacent.

**New visual system:**
- `ink` (#05070B) — deepest black
- `smoke` (#0D0F14) — near-black with blue undertone
- `graphite` (#1A1D24) — dark panel
- `silver` (#8A8F9A) — mid-grey
- `ash` (#C4C7CE) — light grey
- `bone` (#F0EEE9) — warm off-white
- `foreground` (#F6F5F3) — primary text
- All borders: white at varying opacity (0.06–0.22)
- No amber, no oxblood, no brass

### Space Badges — Monochrome
- `space-badge` — neutral, low opacity
- `space-badge-defrag` — slightly brighter white border
- `space-badge-covenant` — slightly dimmer
- `badge-pro` — white border, white text
- Removed: `space-badge-amber`, `space-badge-oxblood`

### Button System — Monochrome
- `sovv-button-primary` — white fill, black text
- `sovv-button` — transparent, white border
- `sovv-button-ghost` — text only
- Removed: `sovv-button-amber`

### Card System
- `sovv-card` — black background, white/10 border
- `sovv-panel` — smoke (#0D0F14) background, elevated
- Removed: `sovv-card-accent`, `sovv-card-pro`

---

## ASCII / Fragment Animation Concept

**Concept:** Defrag is a nod to defragmentation — fragmentation → order, psyche/relationship/self pattern becoming legible.

**Implementation:**
- `FragmentGrid` component on landing hero — scattered chars resolve into structured state
- `FragmentLoader` in Thread — fragment chars animate during AI processing
- `fragment-char` CSS class — monospace chars at low opacity
- `fragmentResolve` keyframe — letter-spacing + blur resolve animation
- `scan-lines` CSS texture — subtle depth on dark backgrounds
- `grid-bg` CSS texture — structural grid overlay

**Rules applied:**
- `prefers-reduced-motion` respected — animation disabled
- No distracting loops — resolves once and holds
- Used as brand texture, not decoration

---

## Landing Page

- Full-screen hero entry with `min-h-screen`
- Locked hero: "Healing isn't optional. / Holding the pain is."
- FragmentGrid at top and bottom of hero
- Structural grid + scan lines background texture
- Radial depth glow (white, very subtle)
- Scroll indicator fades in at 2s
- Staggered `fadeUp` motion for all hero elements
- Use case tags: Relationship, Family, Boundary, Message, Grief, Parenting, Team, Repair
- Baseline Design section with monochrome SVG structural map
- Spaces section: Defrag (space-badge-defrag), Covenant (space-badge-covenant)
- Library preview panel with `sovv-panel` (smoke background)
- Pricing: white fill for Pro CTA (not brass)
- Footer: clean, minimal

---

## Defrag Space

- Category selector: Relationship, Family, Boundary, Message, Grief, Parenting, Team, Active Now
- Touch-friendly buttons (min-height 36px)
- Upload panel with honest gate: "Image review is not fully available yet. Paste the message text here for now."
- FragmentLoader during AI processing
- Two-person overlay notice: "I can work with your side of this. To compare both Baseline Designs, invite them privately."
- Message reveal animation (fadeUp)
- Active pattern + Best Next Response shown in thread

---

## Brand Assets

### brand-mark.svg
- Geometric precision mark: structural grid, concentric rings, cardinal axes, diagonals
- White center point (not amber)
- Scan lines texture
- Fragment chars as subtle texture
- Corner registration marks
- No color accents

### social-card.svg
- "Healing isn't optional. Holding the pain is." as headline
- Second line at 38% opacity (polarity effect)
- Structural grid + scan lines
- Brand mark (monochrome)
- Fragment chars as texture
- Space labels: DEFRAG SPACE · COVENANT SPACE · BASELINE DESIGN · LIBRARY
- White divider line (not amber)

---

## iOS / Mobile Improvements

- `font-size: 16px` on all inputs (prevents iOS zoom)
- `safe-top`, `safe-bottom` classes with `env(safe-area-inset-*)`
- `touch-target` class: `min-height: 44px`
- Category selector: horizontal scroll, touch-friendly
- `prefers-reduced-motion` support
- No horizontal overflow
- Sticky headers in space pages

---

## Motion / Animation

- Hero: staggered `fadeUp` variants with `framer-motion`
- Fragment grid: resolves on page load (800ms delay)
- Fragment loader: pulsing chars during AI processing
- Upload panel: `AnimatePresence` height animation
- Message reveal: `fadeUp` per message
- Pro upgrade banner: `AnimatePresence` slide-in
- All animations respect `prefers-reduced-motion`

---

## Gated / Incomplete Features

| Feature | Status | Gate |
|---|---|---|
| Covenant space | ✅ Functional | Pro tier required |
| Category selector | ✅ UI complete | Sends category prefix to API |
| Image upload | ⏳ Not built | Honest disabled state with message |
| OCR/image review | ❌ Not available | "Image review is not fully available yet. Paste the message text here for now." |
| Compare With Someone | ⏳ Not built | Two-person overlay notice shown |
| Try It Out | ⏳ Not built | Pro gate in UpgradeModal |
| Watch It | ⏳ Not built | Pro gate in UpgradeModal |
| Audio overview | ⏳ Not built | Pro gate |
| Public Preview | ⏳ Not built | Future |
| Invite Privately | ⏳ Not built | Notice shown in Thread |

---

## Remaining Backend / Dashboard Tasks

See `docs/CLOUDFLARE_DASHBOARD_HANDOFF.md` for full detail.

1. Connect sovv-web to Cloudflare Workers Builds (primary deploy)
2. Connect sovereign-os-api to Cloudflare Workers Builds
3. Enable Email Routing on defrag.app
4. Add send_email binding after Email Routing verified
5. Redeploy sovereign-os-api (KV binding rename)
6. Delete orphaned sovv Worker