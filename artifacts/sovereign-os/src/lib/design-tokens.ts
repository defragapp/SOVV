/**
 * Sovereign.os — Global Design Tokens
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for every visual constant in the system.
 *
 * RULES:
 *   1. All inline style={{ }} color and surface values MUST reference this file.
 *   2. Tailwind utility classes are a shorthand layer only — never invent new
 *      palette values in className strings; use the constants below instead.
 *   3. Typography families are assigned by semantic role — never by aesthetics.
 *   4. Spacing lives on the 4px / 8px grid. No arbitrary pixel values.
 */

// ─── Canvas surfaces ──────────────────────────────────────────────────────────
export const surface = {
  /** L0 · Global OS canvas — the absolute background */
  canvas: '#08070a',
  /** L0b · Secondary canvas depth (used for section alternation) */
  canvasAlt: '#0c0a0d',
  /** L1 · Frosted overlay — modals, detail panels (requires backdropFilter) */
  glass: 'rgba(8,7,10,0.95)',
  /** L1 light · Lighter frosted surface for nested panels */
  glassLight: 'rgba(8,7,10,0.90)',
  /** L1 nav · Glass nav container / inactive tab surface */
  nav: 'rgba(255,255,255,0.04)',
  /** L1 nav active · Active tab / selected item surface */
  navActive: 'rgba(255,255,255,0.08)',
  /** L1 input · Activated glass button / input focus ring surface */
  inputActive: 'rgba(255,255,255,0.10)',
  /** Hairline · Separator line at standard weight */
  hairline: 'rgba(255,255,255,0.06)',
  /** Hairline strong · Slightly more visible list row separator */
  hairlineStrong: 'rgba(255,255,255,0.08)',
} as const;

// ─── Accent colors ────────────────────────────────────────────────────────────
export const accent = {
  /** Amber · Primary OS accent — live indicators, amber CTAs, glow dots */
  amber: '#e0743a',
  amberGlow: 'rgba(224,116,58,0.6)',
  amberGlowStrong: 'rgba(224,116,58,0.9)',
  /** Cream · Primary action button fill — all top-level CTAs */
  cream: '#f4efe9',
} as const;

// ─── Text colors ──────────────────────────────────────────────────────────────
export const text = {
  /** T1 · Heading / primary action text */
  primary: '#f4efe9',
  /** T2 · Standard prose, secondary content */
  secondary: '#a8a29a',
  /** T3 · Muted supporting text, descriptions */
  muted: '#76716b',
  /** T4 · Dim — metadata labels, placeholder text, disabled states */
  dim: '#4f4b47',
  /** T5 · Body — AI output text, list row content */
  body: '#d4cec8',
} as const;

// ─── Shape tokens ─────────────────────────────────────────────────────────────
// Map to Tailwind classes. Use these names in code comments for clarity.
export const shape = {
  /** Slab · All interactive glass elements, every button in the OS */
  slab: 'rounded-2xl',    // 16px
  /** Input · Form fields, small interactive chips */
  input: 'rounded-xl',    // 12px
  /** Modal · Full overlay surfaces that need containment */
  modal: 'rounded-3xl',   // 24px
  /** Chip · Inline micro-tags and pill badges */
  chip: 'rounded-lg',     // 8px
} as const;

// ─── Typography (font-family CSS variables) ───────────────────────────────────
// ASSIGNMENT RULES — no exceptions:
//   Fraunces (serif) → ALL headings / display text
//   Geist (sans)     → ALL prose, body copy, UI text
//   JetBrains Mono   → ALL metadata, labels, status tags, timestamps, data
export const font = {
  serif: 'var(--app-font-serif)',
  sans:  'var(--app-font-sans)',
  mono:  'var(--app-font-mono)',
} as const;

// ─── Physics (Framer Motion spring configs) ───────────────────────────────────
export const physics = {
  /** Ambient parallax — slow, weighty */
  ambient:  { stiffness: 50,  damping: 20 },
  /** Button tap — snappy glass response */
  tap:      { stiffness: 400, damping: 20 },
  /** List / section entrance */
  entrance: { stiffness: 300, damping: 28 },
} as const;

// ─── Shared glass action button style ─────────────────────────────────────────
// Used by every submit/action button inside OS spaces (Defrag, Covenant, Alignment).
// Apply via: style={glassActionButton.active} or glassActionButton.inactive
export const glassActionButton = {
  active: {
    background: surface.inputActive,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    color: text.primary,
    boxShadow: `0 0 0 1px ${surface.inputActive} inset`,
  },
  inactive: {
    background: surface.nav,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    color: text.dim,
    boxShadow: `0 0 0 1px ${surface.nav} inset`,
  },
} as const;

// ─── Cream primary CTA style ──────────────────────────────────────────────────
// Shared by every top-level action button (Enter OS, Upgrade, Get Started, etc.)
export const creamCta = {
  base: {
    background: accent.cream,
    color: surface.canvas,
  },
} as const;

// ─── Amber Pro CTA style ──────────────────────────────────────────────────────
export const amberCta = {
  base: {
    background: accent.amber,
    color: accent.cream,
  },
} as const;
