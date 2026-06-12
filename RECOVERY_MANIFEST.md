# Recovery Manifest

The 12+ remote branches appear to have been created before a significant rewrite or rebase of the `main` branch. As a result, comparing them directly to the current `main` shows massive differences (such as adding the entire repository). However, a careful review of the intent and unique commits within those branches reveals the following:

## Branch Audits

### 1. `fix-natal-mass-assignment-14237051651276703173`
**Intent:** Fix mass assignment vulnerability in `POST /api/natal`.
**Status:** Recovered/Already in Main. The current `main` branch already explicitly extracts `name, birthDate, birthTime, birthLocation` from the body in `apps/worker/src/index.ts`. No new code needs to be extracted.
**Excluded Files:** All other files were bloat or already present.

### 2. `fix/insecure-cors-fallback-15400170768828123530`
**Intent:** Add `Vary: Origin` and remove hardcoded CORS headers.
**Status:** Recovered/Already in Main. `apps/worker/src/cors.ts` currently exists in `main` and performs the `ALLOWED_ORIGINS` check securely. No further code extraction is necessary.

### 3. `fix-promo-code-race-condition-3755311111780864358`
**Intent:** Fix race condition for promo codes.
**Status:** Recovered/Already in Main. `apps/worker/src/auth.ts` already contains the atomic SQL `UPDATE` statement `SET use_count = COALESCE(use_count, 0) + 1` to prevent race conditions.

### 4. `jules-1714688031916608475-d3b0ebaf`
**Intent:** Define `new_classes` for Durable Object migration.
**Status:** Needs Recovery. The `apps/worker-session/wrangler.toml` in `main` is severely corrupted (duplicate configuration blocks). We will recover a clean version of this file and apply the `new_classes = ["ConflictSessionDO"]` fix as mandated by the memory directives.

### 5. Other Branches (`feature-optimize-pattern-insertion`, `feature-queue-optimization`, `feature-test-safe-json-parse`)
**Intent:** Various experiments and test additions.
**Status:** Excluded. These branches did not contain cleanly mergeable logic relative to the new `main` architecture. Following the `No Drift / No Bloat` and "prioritize logic over recency" rules, these experimental branches are discarded in favor of `main`'s stable architectural source of truth.

---

## Action Taken
- Restored and fixed `apps/worker-session/wrangler.toml` using the directives from the DO migration branch.
- No other logic changes were required from the orphaned branches, as the critical security and concurrency fixes were already incorporated into the current `main` state.
- All orphaned remote branches will be deleted.
