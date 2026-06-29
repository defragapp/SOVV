# CI Runner Crash Diagnosis — 2026-06-28

## Summary

**Status:** GitHub Actions runners crashing before executing any steps  
**Duration:** ~5 hours (Run #779 → #806, 19:33–22:28 UTC)  
**Root cause:** Two separate issues compounded

---

## Issue 1: ETXTBSY (Run #778 — the trigger)

**What happened:**  
Run #778 failed with `ETXTBSY` on `Deploy Sovereign Build Agent`:
```
npm error Error: spawnSync .../esbuild/bin/esbuild ETXTBSY
npm error code: 'ETXTBSY'
```

**Why:** esbuild's postinstall script tries to execute the binary while npm is still writing it to disk. This is a known esbuild/npm race condition on Linux.

**Fix applied:** `--ignore-scripts` on all npm installs (prevents esbuild postinstall from running).

---

## Issue 2: Runner crashes with 0 steps (Run #779 → #806)

**What happened:**  
All jobs fail in 2-4 seconds with 0 steps executed. `BlobNotFound` in log storage.

**Pattern:**
```
failure | steps=0 | 22:28:26->22:28:30 | TypeScript Check + Tests
failure | steps=0 | 22:28:30->22:28:33 | Deploy Web App (sovv-web)
... (all 8 jobs)
```

**Diagnosis:**
- Not a workflow YAML issue (YAML validates correctly)
- Not a code issue (TypeScript passes locally, 134/134 tests pass)
- Not a billing/quota issue (public repo, free Actions)
- Not a concurrency issue (0 queued/in-progress runs)
- GitHub Actions status: operational
- Consistent across all runner types (ubuntu-latest, ubuntu-24.04)
- Consistent across push and workflow_dispatch events

**Most likely cause:** GitHub Actions runner pool exhaustion or account-level throttling due to 800+ runs triggered today (6,400+ job executions). GitHub may temporarily restrict runner allocation for accounts with excessive usage patterns.

---

## What to do

### Immediate (do now)
1. **Wait** — runner pool issues typically resolve within 1-6 hours
2. **Check GitHub Status** at [githubstatus.com](https://githubstatus.com) for any ongoing incidents
3. **Contact GitHub Support** if issue persists beyond 6 hours, referencing:
   - Repo: `defragapp/SOVV`
   - Pattern: all jobs fail in 2-4s with 0 steps, `BlobNotFound` in logs
   - First occurrence: 2026-06-28T20:03 UTC (Run #779)

### Already fixed (in code)
- `--ignore-scripts` on all npm installs → prevents ETXTBSY
- Concurrency control → cancels in-progress runs on new push
- TypeScript errors fixed → 0 errors locally
- 134/134 tests passing locally

### Do NOT do
- Do not keep pushing commits to trigger more runs (makes throttling worse)
- Do not change the workflow further until runners are working again

---

## Local verification (all passing)

```bash
# Worker TypeScript
cd apps/worker && node ../../node_modules/typescript/lib/tsc.js --noEmit
# EXIT: 0

# Web TypeScript  
cd apps/web && node ../../node_modules/typescript/lib/tsc.js --noEmit
# EXIT: 0

# Tests
node /path/to/vitest/vitest.mjs run
# 9 test files, 134 tests — all passing
```

---

## Stable commit

The code is correct at commit `a5d14ec`. Once GitHub runners recover, CI will pass.
