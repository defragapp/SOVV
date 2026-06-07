# UI Rendering Fix Report

**Date:** 2026-06-07
**Commit:** 40f5e0b
**Version deployed:** ee92615d-614a-4cfa-ad20-4f160a473974

---

## Root Cause

`apps/web/app/layout.tsx` was injecting a stale global header on every page:

```tsx
// BEFORE (broken)
<html className="bg-background text-foreground antialiased selection:bg-white selection:text-black">
  <body className="min-h-screen bg-background text-foreground overflow-x-hidden">
    <header className="p-6 border-b border-white/10">
      <span className="font-mono font-bold tracking-widest text-white">SOVEREIGN.OS</span>
    </header>
    {children}
  </body>
</html>
```

This caused:
1. **Double header** — the root layout injected a `SOVEREIGN.OS` header on top of every page, including the landing page which has its own full-screen fixed nav
2. **Layout collision** — the landing page hero (`min-h-screen`) was pushed down by the unexpected header, breaking the full-screen entry
3. **Token risk** — `bg-background` and `text-foreground` Tailwind tokens on `html`/`body` could fail if token resolution was inconsistent in production

---

## Fix Applied

`apps/web/app/layout.tsx` — 1 file changed:

```tsx
// AFTER (fixed)
<html lang="en" className="antialiased" style={{ background: "#05070B", color: "#F6F5F3" }}>
  <body className="min-h-screen overflow-x-hidden" style={{ background: "#05070B", color: "#F6F5F3" }}>
    {children}
  </body>
</html>
```

Changes:
- Removed stale global header entirely
- Replaced Tailwind token classes (`bg-background`, `text-foreground`) with explicit inline hex values for guaranteed production rendering
- Removed `selection:bg-white selection:text-black` (handled in globals.css `::selection`)
- Each page/shell now manages its own navigation independently

---

## CSS/Build Status

The CSS pipeline was **not broken**. All design system classes were correctly generated:

| Check | Result |
|---|---|
| CSS file generated | ✅ `f74f6cb3be725dd1.css` — 22,529 bytes |
| Tailwind v4 | ✅ Correct — `@tailwind base/components/utilities` + `@theme` |
| `sovv-button-primary` | ✅ Present in CSS |
| `sovv-button` | ✅ Present |
| `container-platform` | ✅ Present |
| `section-gap` | ✅ Present |
| `text-display` | ✅ Present |
| `text-headline` | ✅ Present |
| `grid-bg` | ✅ Present |
| `scan-lines` | ✅ Present |
| `fragment-char` | ✅ Present |
| `glass` | ✅ Present |
| `sovv-panel` | ✅ Present |
| `:root` CSS variables | ✅ Present (`--background`, `--foreground`, etc.) |
| `@keyframes` | ✅ fadeIn, fadeUp, shimmer, fragmentResolve, scan |

---

## Layout Architecture (correct)

Each surface manages its own navigation:

| Surface | Navigation |
|---|---|
| Landing page (`app/page.tsx`) | Inline fixed nav with `SOVEREIGN.OS` brand |
| Marketing pages (`SiteShell`) | `components/marketing/site-shell.tsx` header |
| App shell (`/apps/defrag`, `/apps/covenant`) | `components/workspace/Shell.tsx` header |
| Login (`/app/login`) | `components/workspace/LoginScreen.tsx` |

The root `layout.tsx` provides only: `<html>`, `<body>`, metadata, and global CSS import.

---

## Before/After Issue Checklist

| Issue | Before | After |
|---|---|---|
| Double header on landing | ❌ Root layout + page nav | ✅ Page nav only |
| Hero full-screen entry | ❌ Pushed down by header | ✅ min-h-screen from top |
| bg-background token | ❌ Tailwind token (risk) | ✅ Explicit hex #05070B |
| text-foreground token | ❌ Tailwind token (risk) | ✅ Explicit hex #F6F5F3 |
| CSS pipeline | ✅ Was correct | ✅ Correct |
| Design system classes | ✅ Were generated | ✅ Generated |
| Fragment animation | ✅ Was correct | ✅ Correct |
| Buttons/CTAs | ✅ Were styled | ✅ Styled |

---

## Deploy Status

- **Deployed:** ✅ Version `ee92615d-614a-4cfa-ad20-4f160a473974`
- **Commit pushed:** ✅ `40f5e0b` on `main`
- **Domains:** defrag.app HTTP 200, app.defrag.app HTTP 307

---

## Workers Builds Auto-Deploy

Workers Builds git connection is not yet configured (requires dashboard OAuth).
Future pushes to `main` will not auto-deploy until connected.

See `docs/CLOUDFLARE_BUILDS_FINAL_STANDARD.md` for connection steps.