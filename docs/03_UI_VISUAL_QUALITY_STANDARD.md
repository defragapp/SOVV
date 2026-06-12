# UI Visual Quality Standard

## Overview

Sovereign.os utilizes a strictly monochrome, premium design system. The aesthetics should avoid "wall-of-text" designs and emphasize structured layouts with high contrast.

## CSS & Tailwind Baseline

1. **Tokens and Variables:**
   Use the CSS custom properties in `globals.css` (e.g., `--bg-primary`, `--accent-oxblood`) combined with Tailwind config mapping (e.g., `bg-background`, `text-foreground`).
2. **Stable Roots:**
   Ensure the `<body>` element explicitly applies fallback colors (`bg-background text-foreground`) to avoid unstyled white flashes.
3. **Restricted Palette:**
   Adhere to the charcoal/monochrome palette. Decorative gradients and colorful elements should be avoided unless explicitly defined (e.g., specific deep gradients for landing pages).

## Component Architecture

- Rely on unified UI primitives (e.g., `Button`, `Card`, `Container`, `Section`, `Badge`).
- Ensure consistent hover and focus states (focus-visible rings) for accessibility.
- Button components should use the standard cubic bezier transition `(0.16, 1, 0.3, 1)`.

## Workspace & Mobile Shell

1. **Desktop Shell:**
   Uses a robust 3-column app shell.
2. **Mobile Shell:**
   Mobile views must employ horizontally scroll-locked, segmented tabs rather than squishing columns. This entirely eliminates horizontal overflow on iOS.
3. **Tap Targets & Viewport:**
   - Minimum tap target size must be 44px on mobile devices.
   - Text inputs must be exactly `16px` to prevent automatic iOS zoom.
   - Layouts must incorporate `safe-top` and `safe-bottom` CSS classes mapping to `env(safe-area-inset-*)`.

## Layout & Hierarchy

- Prefer "bento-style" grids and visually delineated structural containers instead of raw unstructured text walls.
- Ensure clear empty states with adequate opacity (avoid very low contrast like `text-[#F6F5F3]/18`). Ensure text is readable.

## Visual Assets

- Fallback standard `manifest.json` and meta tags for PNG images. Ensure SVG icons have static PNG fallbacks to maintain consistency across OS previews.
- Next.js layout should always correctly reference `favicon.ico`.
