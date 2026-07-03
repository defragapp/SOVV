---
name: Sovereign.os Vite port
description: Key patterns and gotchas from porting Next.js Sovereign.os to Vite/React (wouter) in the monorepo
---

## Migration decisions

**Why:** Replit uses react-vite artifacts, not Next.js. The app was imported from Vercel and needed porting.

**How to apply:** Use these patterns for any future Next.js→Vite migration in this project.

## Key patterns

### Next.js `Image` with `fill` prop
The most common crash: `Failed to construct 'Image': Please use the 'new' operator`.
Happens when Next.js `Image` is left in the codebase after removing the import.
**Fix:** Replace with:
```tsx
<img src="..." alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
```

### Redirect routes in wouter v3
Arrow functions as children fail typecheck: `{() => <Redirect to="/about" />}` is wrong.
**Fix:** Use JSX children directly:
```tsx
<Route path="/product"><Redirect to="/about" /></Route>
```

### Missing `@/lib/api` module
`BaselineEntry.tsx` imported `apiSaveBaseline` from `@/lib/api` which doesn't exist.
**Fix:** Inline the fetch call directly in the component.

### Font loading without Next.js
- Fraunces and Geist: loaded via Google Fonts `<link>` in `index.html`
- JetBrains Mono: loaded via `@font-face` in `index.css` pointing to `/fonts/JetBrainsMono-VariableFont.woff2`

### `process.env.NEXT_PUBLIC_*` → `import.meta.env.VITE_*`
Found in `LoginScreen.tsx`. Replace all `process.env.NEXT_PUBLIC_` with `import.meta.env.VITE_`.

### `"use client"` directives
Must be removed from all component files — sed bulk approach works:
```bash
find components/ -name "*.tsx" | xargs sed -i '1{/^"use client";$/d}'
```

### API proxy
All `/api/*` routes forward to `https://api.defrag.app` via `http-proxy-middleware` in api-server.
Proxy is mounted at `artifacts/api-server/src/routes/proxy.ts`.

### `@sovereign/core` package
Copied to `artifacts/sovereign-os/src/lib/core/` (types.ts, chips.ts, util.ts) with barrel index.ts.
No npm install needed — just path aliasing via `@/lib/core`.

### Sidebar default export
`Sidebar.tsx` uses `export default function Sidebar` — import as `import Sidebar from '...'`, not named.
