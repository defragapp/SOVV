# INFRASTRUCTURE.md
# Last synced: 2026-06-11
# Source of truth: Cloudflare Dashboard + Live API
# DO NOT EDIT BINDING IDs MANUALLY — Update via API audit only

---

## Your Complete Platform Architecture Map

This is the ground truth of your Cloudflare account as of 2026-06-11. It is the contract between your codebase and your edge.

---

### 1. Worker-to-Codebase Mapping

| Worker | Source Directory | Routes | Status |
|--------|-----------------|--------|--------|
| `sovv-web` | `apps/web/` | `sovereign.defrag.app/*`, `app.defrag.app/*`, `www.defrag.app/*`, `defrag.app/*` | **Public-facing** |
| `worker-ai` | `apps/worker-ai/` | `ai.defrag.app/*` | **Public-facing** |
| `sovereign-os-api` | `apps/worker/` | `api.defrag.app/*` | **Public-facing** |
| `worker-session` | `apps/worker-session/` | `session.defrag.app/*` | **Public-facing** |

---

### 2. Storage Resources (Never Delete These)

| Resource | Type | ID/Name | Used By |
|----------|------|---------|---------|
| `vibesdk-db` | D1 | `c8c2fd8d-5297-46fc-8594-7629c8bad74d` | `sovereign-os-api` |
| `developer-db` | D1 | `a6994b42-81ef-4fd7-a001-09526be1b2db` | `developer` |
| `SOVV_DATA` | KV | `3bd3ff5048a8468e82c574d7d66045c3` | `sovereign-os-api` |
| `vibesdk-templates` | R2 | — | `sovereign-os-api` |
| `developer-assets` | R2 | — | `developer` |
| `web-opennext-cache` | R2 | — | *(likely Next.js cache)* |
| `pattern-extraction-tasks` | Queue | `396e3d8f0b0c4b1d9407409b4e138f81` | `sovereign-os-api` |

---

## Unmapped Workers
The following workers exist in Cloudflare dashboard but are not in this repository:
- `developer` (D1: developer-db, R2: developer-assets)
- `sovereign-build-agent`
- `sovereign-code-agent`

**Do not delete these in dashboard.** They may be managed in a separate repo or manually.

## Operational TODOs
- [ ] Implement DO alarm-based garbage collection for CONFLICT_SESSION
  - Sessions idle >24h should self-terminate via `state.storage.setAlarm()`
  - See: https://developers.cloudflare.com/durable-objects/api/storage/#setalarm

## Future State: Sovereign Rebrand
Planned migration to rename all workers to Sovereign-* prefix:
- `sovv-web` → `Sovereign-web`
- `worker-ai` → `Sovereign-ai`
- `sovereign-os-api` → `Sovereign-api`
- `worker-session` → `Sovereign-session`

**Blocked until:** Edge is stable and dashboard route migration can be planned.
