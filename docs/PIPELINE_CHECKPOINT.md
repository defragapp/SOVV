# Sovereign.os — Pipeline Architecture Checkpoint
**Date:** 2026-06-25  
**Stable tag:** `v0.5.0-pipeline` (commit `b700de6`)  
**CI status:** ✅ 9/9 jobs green

---

## What is now true

### Architecture

```
Before:                          After:
─────────────────────────────    ─────────────────────────────
DefragPage → fetch('/api/explain')   processInput({ space: 'defrag' })
CovenantPage → fetch('/api/covenant')  processInput({ space: 'covenant' })
AlignmentPage → fetch('/api/alignment') processInput({ space: 'alignment' })
                                         ↓
                                   SystemOutput (unified)
                                         ↓
                                   systemStore.output
                                         ↓
                                   Page renders from meta
```

### Files introduced

| File | Purpose |
|------|---------|
| `apps/web/lib/system/outputContract.ts` | Unified `SystemOutput` type + space-specific meta types + adapters |
| `apps/web/lib/system/processInput.ts` | Single pipeline entry point for all user input |
| `apps/web/lib/system/streamText.ts` | Word-by-word streaming helper (ready to wire) |
| `apps/web/state/systemStore.ts` | Updated: `output: SystemOutput \| null` (+ `lastOutput` alias) |

### Spaces migrated

| Space | Status | Commit |
|-------|--------|--------|
| Defrag | ✅ processInput | `71d2c53` |
| Covenant | ✅ processInput | `b700de6` |
| Alignment | ✅ processInput | `b700de6` |

---

## What is intentionally transitional

These are **not bugs** — they are deliberate migration steps:

1. **`lastOutput` alias in systemStore** — kept for backward compatibility with `OsHeader` and `OsOutput` components that read `lastOutput`. Will be removed once all consumers migrate to `output`.

2. **`ResultCard` still used in all 3 spaces** — `OsOutput` component exists but is not yet the primary renderer. `ResultCard` renders from `result` (local state = `output.meta`). This is correct — renderer replacement is the next phase.

3. **`streamText.ts` not yet wired** — the streaming helper exists but is not connected to any renderer. Ready for the next phase.

4. **`AlignmentMeta` and `CovenantMeta` in outputContract.ts** — defined but Alignment/Covenant pages still use their own local result types. The meta types are the bridge — pages set `result = pResult.output.meta as AlignmentMeta`.

---

## What to do next (in order)

### Phase 5a — Shared renderer (OsOutput as primary)
Replace `ResultCard` with `OsOutput` as the primary output renderer in Defrag first, then Alignment, then Covenant.

### Phase 5b — Wire streamText
Connect `streamText.ts` to `OsOutput` so `output.primary` streams word-by-word on arrival.

### Phase 5c — Real pipeline logic
Move AI call logic from individual API routes into a shared pipeline that can chain Defrag → Alignment → Covenant.

---

## Credential rotation required

The following credentials were used during this session and **must be rotated**:

- **GitHub PAT** (`ghp_[REDACTED — rotate immediately]`) — appeared in session transcript. Revoke at github.com/settings/tokens and replace with a new token stored only in GitHub Actions secrets.
- **Cloudflare API Token** (`cfat_[REDACTED — rotate immediately]`) — appeared in session transcript. Revoke at dash.cloudflare.com and replace.
- **R2 Access Key / Secret** — appeared in session transcript. Rotate at dash.cloudflare.com → R2 → Manage API tokens.

**None of these credentials appear in the git history** (verified by grep). The exposure was only in the session transcript.

### Safe auth pattern going forward

```bash
# ❌ Never do this:
git push https://ghp_TOKEN@github.com/org/repo.git main

# ✅ Do this instead:
git remote set-url origin https://github.com/org/repo.git
# Then use gh auth login or SSH keys
```

For CI: store all tokens as GitHub Actions secrets, never inline in workflow files.

---

## Rollback instructions

To return to this stable state:

```bash
git checkout v0.5.0-pipeline
# or
git reset --hard b700de6
```

The previous stable state (before pipeline work) is at:
```bash
git checkout 51574ac  # last clean state before pipeline migration
```
