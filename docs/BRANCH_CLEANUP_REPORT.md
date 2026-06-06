# Branch Cleanup Report

**Date:** 2026-06-06
**Inspected by:** Sovereign Realignment

---

## Summary

All 4 remote branches have **zero commits ahead of main** — they are fully merged. No open PRs exist.

---

## Branch Classification Table

| Branch | Status | Commits Ahead of Main | Useful Files | Conflicts | Recommended Action |
|---|---|---|---|---|---|
| `origin/main` | ✅ Active mainline | — | — | — | Keep |
| `origin/feat/host-routing` | ✅ Fully merged | 0 | All useful code already on main | Was: defrag.app → /tool (wrong hierarchy, fixed on main) | **Delete remote branch** |
| `origin/feat/api-wireup` | ✅ Fully merged | 0 | All useful code already on main | Was: hub/tool routing, old auth flow (fixed on main) | **Delete remote branch** |
| `origin/codespace-expert-umbrella-969x5v7q9j64cx4xg` | ✅ Fully merged | 0 | Emergency save — all content on main | — | **Delete remote branch** |
| `origin/codespace-symmetrical-meme-xrw4p659wr5whpxvq` | ✅ Fully merged | 0 | Emergency save — all content on main | — | **Delete remote branch** |

---

## Branch Detail

### feat/host-routing
- **Status:** Fully merged into main (0 commits ahead)
- **What it contained:** Host-based routing (defrag.app → /tool, sovereign.defrag.app → /hub), monochrome theme, hub/tool page structure
- **Conflicts with standard:**
  - Routed `defrag.app` directly to a standalone Defrag tool (`/tool`) — violates platform hierarchy
  - Treated `sovereign.defrag.app` as permanent canonical hub — it is transitional only
  - Used "WORKSPACE" in user-facing copy
  - Used old auth flow (`/auth` redirect)
- **Resolution:** All useful routing concepts were ported to main with correct hierarchy. Stale pages (hub/auth, hub/members, hub/billing, tool/workspace, tool/natal) converted to redirects on main.
- **Recommended action:** Delete remote branch (already merged)

### feat/api-wireup
- **Status:** Fully merged into main (0 commits ahead)
- **What it contained:** API wiring, natal routes, CORS config, hub billing/members/dashboard pages, auth integration
- **Conflicts with standard:**
  - Hub/tool routing model (same as feat/host-routing)
  - Old middleware routing patterns
- **Resolution:** Useful API wiring was merged. Stale pages converted to redirects.
- **Recommended action:** Delete remote branch (already merged)

### codespace-expert-umbrella-969x5v7q9j64cx4xg
- **Status:** Fully merged into main (0 commits ahead)
- **What it contained:** Emergency codespace save with itty-router refactor, build fixes
- **Conflicts with standard:** None — content was already aligned
- **Recommended action:** Delete remote branch (already merged)

### codespace-symmetrical-meme-xrw4p659wr5whpxvq
- **Status:** Fully merged into main (0 commits ahead)
- **What it contained:** Emergency codespace save with auth/schema/bindings fixes
- **Conflicts with standard:** None — content was already aligned
- **Recommended action:** Delete remote branch (already merged)

---

## Remote Branch Deletion

All 4 remote branches are safe to delete. They are fully merged and their content is on main.

To delete from GitHub:
```bash
git push origin --delete feat/host-routing
git push origin --delete feat/api-wireup
git push origin --delete codespace-expert-umbrella-969x5v7q9j64cx4xg
git push origin --delete codespace-symmetrical-meme-xrw4p659wr5whpxvq
```

Or via GitHub UI: Repository → Branches → Delete each branch.

---

## Files Removed in This Cleanup Pass

### Compiled artifacts (never should have been committed)
- `apps/worker/index.js`, `index.js.map`, `index.d.ts`, `index.d.ts.map`
- `apps/worker/src/*.js.map` (42 files)
- `apps/worker/src/*.d.ts.map` (42 files)

### Stale IDE/tool configs
- `.clinerules` — stale Cloudflare context notes, superseded by `docs/`
- `.continue/agents/new-config.yaml` — placeholder config with example API keys
- `.continue/config.json` — IDE config with hardcoded gateway URL

### Stale web artifacts
- `apps/web/config_json.code-search` — VS Code search artifact
- `apps/web/hero-css-snippets.css` — unused CSS snippets
- `apps/web/hero.module.css` — used only by removed SpotlightLanding
- `apps/web/styles/globals.css` — duplicate of `apps/web/app/globals.css`
- `apps/web/app/landing/page.tsx` — duplicate landing (canonical is `app/page.tsx`)
- `apps/web/public/vercel.svg` — Vercel starter asset
- `apps/web/public/window.svg` — Next.js starter asset
- `apps/web/public/globe.svg` — Next.js starter asset

### Unused root components (superseded by workspace/ and marketing/ components)
- `apps/web/components/Composer.tsx` — unused
- `apps/web/components/Hero.tsx` — unused
- `apps/web/components/MemoryInsights.tsx` — unused
- `apps/web/components/SpotlightLanding.tsx` — unused
- `apps/web/components/StudioPanel.tsx` — unused
- `apps/web/components/ArtifactList.tsx` — unused (only consumer was StudioPanel)
- `apps/web/lib/storage.ts` — unused (only consumer was ArtifactList)

### Misplaced worker files
- `apps/worker/src/page.tsx` — React page file in worker source directory

### Duplicate packages/core root files
- `packages/core/HistoryTimeline.tsx`, `MemoryPanel.tsx`, `PatternCard.tsx`, `memory.ts`, `page.tsx`
- Canonical versions are in `packages/core/src/`

---

## Files Converted to Redirects (stale pages from merged branches)

| Old File | Old Behavior | New Behavior |
|---|---|---|
| `apps/web/app/workspace/page.tsx` | `redirect("/app")` | `redirect("/apps/defrag")` |
| `apps/web/app/app/page.tsx` | Full Shell render | `redirect("/apps/defrag")` |
| `apps/web/app/tool/workspace/page.tsx` | Old workspace UI | `redirect("/apps/defrag")` |
| `apps/web/app/tool/natal/page.tsx` | Natal input form | `redirect("/settings")` |
| `apps/web/app/hub/auth/page.tsx` | Old auth form | `redirect("/app/login")` |
| `apps/web/app/hub/members/page.tsx` | Members management UI | `redirect("/hub/dashboard")` |
| `apps/web/app/hub/billing/page.tsx` | Billing UI | `redirect("/hub/dashboard")` |

---

## Build Results

```
OpenNext build: ✅ PASS
  .open-next/worker.js: ✅ exists (2278 bytes)
  .open-next/assets/: ✅ exists

Worker dry-run: ✅ PASS
  Bindings verified: KV, PATTERN_QUEUE, DB, TEMPLATES, AI_SERVICE, SESSION_SERVICE, AI, RATE_LIMITER
  Upload size: 62.96 KiB / gzip: 16.29 KiB
```

---

## Remaining Manual Decisions

1. **Delete remote branches** — all 4 are safe to delete (see commands above)
2. **`apps/web/components/Chips.tsx`** — used by `components/Thread.tsx` (root Thread, not workspace/Thread). Verify if root Thread is still needed or if workspace/Thread.tsx is the canonical one.
3. **`apps/web/components/AudioOverview.tsx`** — used only by removed StudioPanel. Consider removing in next pass.
4. **`apps/web/components/AnimatedOverview.tsx`** — used only by removed StudioPanel. Consider removing in next pass.
5. **`apps/web/components/Thread.tsx`** (root) — separate from `apps/web/components/workspace/Thread.tsx`. Verify which is canonical.
6. **`packages/core/src/geneKeyMeanings.ts` and `geneKeys.ts`** — large data files. Verify if they are imported anywhere in the active codebase.