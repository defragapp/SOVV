# Sovereign.os — Cinematic Color Token System
**Version:** 2.0  
**Date:** 2026-06-30  
**Status:** Canonical — do not override without design review

---

## Philosophy

The visual system is built on one principle:  
**Warmth through restraint.**

Dark warm-black foundation. Amber used only as light, signal, and atmosphere — never as brand color. Off-white text. Stone gray hierarchy. Thin borders. Grain. Depth.

The system should feel like a private intelligence layer, not a product.

---

## 1. BACKGROUND TOKENS

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#08070a` | Page background, hero, main surfaces |
| `--bg-secondary` | `#0c0a0d` | Panels, cards, elevated sections |
| `--bg-elevated` | `#131015` | Modals, dropdowns, highest elevation |

**CSS:**
```css
--bg-primary: #08070a;
--bg-secondary: #0c0a0d;
--bg-elevated: #131015;
```

**Tailwind equivalents:**
```
bg-[#08070a]   bg-[#0c0a0d]   bg-[#131015]
```

---

## 2. TEXT TOKENS

| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | `#f4efe9` | Headlines, body, primary content |
| `--text-secondary` | `#a8a29a` | Subheadings, descriptions, body copy |
| `--text-tertiary` | `#76716b` | Labels, captions, nav links |
| `--text-disabled` | `#4f4b47` | Disabled states, placeholder text |

**CSS:**
```css
--text-primary: #f4efe9;
--text-secondary: #a8a29a;
--text-tertiary: #76716b;
--text-disabled: #4f4b47;
```

**Hierarchy rule:**
- `#f4efe9` — what the user must read
- `#a8a29a` — what supports the primary
- `#76716b` — what provides context
- `#4f4b47` — what is inactive or secondary metadata

---

## 3. AMBER ACCENT TOKENS

> **RULE: Amber is light, not brand.**  
> Never use amber for logo, wordmark, primary headings, or dominant UI elements.  
> Use amber for: atmospheric light, section dividers, small labels, checkmarks, hover signals, and glow effects.

| Token | Value | Usage |
|-------|-------|-------|
| `--amber` | `#e0743a` | Full amber — use sparingly (FAQ toggles, active states) |
| `--amber-soft` | `rgba(224,116,58,0.25)` | Soft amber glow, hover backgrounds |
| `--amber-glow` | `rgba(224,116,58,0.08)` | Atmospheric glow, light beam base |

**Correct amber uses:**
```
text-[#e0743a]/60   → section divider lines, small labels
text-[#e0743a]/50   → mono metadata labels
text-[#e0743a]/40   → decorative dots, arrows
bg-[#e0743a]/[0.05] → subtle highlight backgrounds
border-[#e0743a]/20 → chip borders
bg-[#e0743a]/60     → horizontal rule accents (h-px w-6)
```

**Forbidden amber uses:**
```
❌ text-[#e0743a]          → wordmark, logo, headings
❌ from-[#e0743a]          → logo gradients
❌ text-[#e0743a] on h1/h2 → primary headlines
❌ bg-[#e0743a]            → dominant backgrounds
```

---

## 4. BORDER TOKENS

| Token | Value | Usage |
|-------|-------|-------|
| `--border-light` | `rgba(255,255,255,0.06)` | Default card/panel borders |
| `--border-medium` | `rgba(255,255,255,0.10)` | Hover states, focused elements |
| `--border-focus` | `rgba(255,255,255,0.25)` | Active inputs, selected states |

**CSS:**
```css
--border-light: rgba(255, 255, 255, 0.06);
--border-medium: rgba(255, 255, 255, 0.10);
--border-focus: rgba(255, 255, 255, 0.25);
```

---

## 5. ACCENT TOKENS (Stone/Warm Gray)

| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#c8c2bc` | Warm stone — subtle highlights |
| `--accent-soft` | `#d4cec8` | Lighter stone |
| `--accent-glow` | `rgba(200,194,188,0.15)` | Stone glow effects |

---

## 6. RADIUS TOKENS

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-container` | `14px` | Cards, panels, modals |
| `--radius-input` | `10px` | Text inputs, textareas |
| `--radius-button` | `8px` | All buttons |
| `--radius-minimal` | `4px` | Chips, badges, small tags |

**Rule:** Never use `rounded-full`, `rounded-3xl`, or `rounded-2xl` on content elements.

---

## 7. TYPOGRAPHY TOKENS

### Fonts
| Role | Font | Variable |
|------|------|----------|
| Serif headline | Fraunces | `--font-fraunces` / `font-serif` |
| Body/UI | Geist Sans | `--font-geist-sans` |
| Mono labels | JetBrains Mono | `--font-jetbrains-mono` / `font-mono` |

### Scale
| Class | Size | Usage |
|-------|------|-------|
| Display | `clamp(3rem, 8vw, 7.5rem)` | Hero headlines |
| Headline | `clamp(2.4rem, 5vw, 4.5rem)` | Section headlines |
| Subheadline | `clamp(1.8rem, 3vw, 3rem)` | Sub-sections |
| Body large | `1.125rem` (18px) | Lead paragraphs |
| Body | `1rem` (16px) | Standard body |
| Label | `0.6875rem` (11px) | Mono uppercase labels |
| Micro | `0.625rem` (10px) | Tiny metadata |

### Typography rules
- Serif (`font-serif`) = Fraunces — editorial, cinematic, soft
- Mono (`font-mono`) = JetBrains Mono — labels, metadata, system text
- Sans = Geist — body, UI, descriptions
- **Never use serif for UI labels or metadata**
- **Never use orange on serif headlines**

---

## 8. MOTION TOKENS

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-apple` | `cubic-bezier(0.16, 1, 0.3, 1)` | All transitions |

**Rules:**
- Fade and translate only — no scale, no bounce
- Duration: 200-400ms for UI, 600-1200ms for hero
- `prefers-reduced-motion` must disable all animations

---

## 9. LOGO / WORDMARK RULES

The Sovereign.os wordmark must always be:
- `text-[#f4efe9]` — off-white (primary)
- `text-[#a8a29a]` — stone (secondary/muted contexts)
- `text-[#76716b]` — tertiary (footer, very small)

**Never:**
- `text-[#e0743a]` — orange
- Any gradient treatment
- Any color that competes with content

---

## 10. BEFORE / AFTER — VISUAL IMPACT

### Site-shell Logo (FIXED)

**Before:**
```tsx
// Orange gradient icon + orange wordmark
<div className="w-8 h-8 rounded-md bg-gradient-to-tr from-[#e0743a] to-[#ffb347]...">
<span className="font-semibold text-lg tracking-tight text-[#e0743a]">
  Sovereign.os
</span>
```
**Visual:** Bright orange logo — felt like a startup SaaS product, not a private intelligence system.

**After:**
```tsx
// Subtle dark panel icon + off-white wordmark
<div className="w-8 h-8 rounded-md bg-white/[0.06] border border-white/[0.10]...">
<span className="font-semibold text-lg tracking-tight text-[#f4efe9]">
  Sovereign.os
</span>
```
**Visual:** Quiet, premium, cinematic. The wordmark recedes into the dark header — it doesn't compete with content.

---

### Homepage Hero Label (FIXED)

**Before:**
```tsx
// Orange mono label under headline
<p className="mt-6 font-mono uppercase tracking-[0.2em] text-[#e0743a]/70 text-[0.65rem]">
```
**Visual:** Orange label drew attention away from the serif headline. Felt like a badge, not atmosphere.

**After:**
```tsx
// Muted off-white mono label
<p className="mt-6 font-mono uppercase tracking-[0.2em] text-[#f4efe9]/30 text-[0.65rem]">
```
**Visual:** Label becomes a quiet whisper beneath the headline. The serif headline dominates. Cinematic hierarchy restored.

---

### Space Card Hover (FIXED)

**Before:**
```tsx
// Orange hover on space name
<h3 className="font-serif text-3xl text-[#f4efe9] group-hover:text-[#f0a06a] transition-colors">
```
**Visual:** Hovering a space card turned the serif headline orange — jarring, inconsistent.

**After:**
```tsx
// Clean white hover
<h3 className="font-serif text-3xl text-[#f4efe9] group-hover:text-[#f4efe9] transition-colors">
```
**Visual:** Hover is expressed through the card's border/background, not text color change.

---

### Campaign Video Cards (FIXED)

**Before:**
```tsx
// Pill-shaped cards
<article className="rounded-3xl border border-white/[0.08]...">
```
**Visual:** `rounded-3xl` = 24px radius — too soft, too consumer-app, too generic.

**After:**
```tsx
// Controlled radius using design token
<article style={{ borderRadius: "var(--radius-container)" }}...>
```
**Visual:** 14px radius — controlled, editorial, consistent with the rest of the system.

---

## 11. CORRECT AMBER USAGE EXAMPLES

These are the 47 correct amber uses across the site:

```tsx
// Section divider line — atmospheric
<span className="h-px w-6 bg-[#e0743a]/60" />

// Mono label — small metadata
<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/50">

// Chip border — evidence tag
<span className="border border-[#e0743a]/20 text-[#e0743a]/60 bg-[#e0743a]/[0.04]">

// Checkmark — feature list
<span className="text-[#e0743a]/60 text-sm">✓</span>

// Dot accent — decorative
<span className="w-1 h-1 rounded-sm bg-[#e0743a]/40" />

// FAQ toggle — interactive signal
<span className="text-xl text-[#e0743a] transition-transform group-open:rotate-45">+</span>

// Pro tier border — pricing card
<div className="border border-[#e0743a]/30 bg-[#0c0a0d]">
```

All of these are correct. Amber at low opacity creates warmth and signal without dominating.

---

## 12. QUICK REFERENCE

```
BACKGROUNDS:   #08070a  #0c0a0d  #131015
TEXT:          #f4efe9  #a8a29a  #76716b  #4f4b47
AMBER ACCENT:  #e0743a  (always with opacity: /60 /50 /40 /30)
BORDERS:       rgba(255,255,255,0.06)  0.10  0.25
RADIUS:        14px  10px  8px  4px
FONTS:         Fraunces (serif)  Geist (sans)  JetBrains Mono (mono)
MOTION:        cubic-bezier(0.16, 1, 0.3, 1)  fade+translate only
```

---

*This document is the canonical visual reference for Sovereign.os.*  
*All design decisions should trace back to these tokens.*
