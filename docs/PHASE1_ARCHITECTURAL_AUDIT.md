# Sovereign.os — Phase 1 Architectural Viability Audit
**Date:** 2026-06-25  
**Scope:** Backend pipeline, D1 schema, CORS, session handling, migration integrity

---

## EXECUTIVE SUMMARY

The backend is structurally sound with one **blocking issue** (migration naming chaos that will cause D1 apply failures), two **high-priority gaps** (missing session index, CORS missing credentials flag), and several **medium issues**. No WebSocket usage found — the platform uses standard HTTP with KV-backed sessions, which is appropriate for this architecture.

---

## 1. BLOCKING — D1 Migration Naming Chaos

**Status: 🔴 BLOCKING**

The migrations directory has conflicting numbering that will cause `wrangler d1 migrations apply` to fail or apply in wrong order:

| Conflict | Files | Risk |
|----------|-------|------|
| `003` appears 3x | `003_design_inputs.sql`, `003_invites.sql`, `003_role.sql` | Undefined apply order |
| `008` appears 2x | `0008_defrag_tables.sql`, `008_invites_v2.sql` | Table collision |
| Mixed prefix format | `0001_`, `0002_` vs `002_`, `003_` | Sort order broken |

`0008_defrag_tables.sql` creates `design_inputs` — which `003_design_inputs.sql` also creates (both use `IF NOT EXISTS`, so no crash, but the schema is duplicated and confusing).

**Fix required:** Rename all migrations to consistent `NNNN_name.sql` format with no gaps or duplicates.

---

## 2. HIGH — Missing Index on sessions.token

**Status: 🟠 HIGH**

```sql
-- Current sessions table (0001_baseline.sql)
CREATE TABLE IF NOT EXISTS sessions (
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,        -- ← NO INDEX
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

Every authenticated request does `SELECT * FROM sessions WHERE token = ?`. Without an index on `token`, this is a full table scan. At scale this becomes a bottleneck on every API call.

**Fix:** Add `CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);`

---

## 3. HIGH — CORS Missing `Access-Control-Allow-Credentials`

**Status: 🟠 HIGH**

```typescript
// Current CORS (index.ts)
const headers = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Vary': 'Origin',
};
// Missing: 'Access-Control-Allow-Credentials': 'true'
```

The frontend uses `credentials: "include"` on all fetch calls. Without `Access-Control-Allow-Credentials: true` in the CORS response, browsers will silently drop cookies/credentials. This means session cookies won't be sent cross-origin — auth will fail for any origin not on the same domain as the worker.

**Fix:** Add `'Access-Control-Allow-Credentials': 'true'` to CORS headers.

---

## 4. MEDIUM — CORS Missing sovv-web workers.dev Origin

**Status: 🟡 MEDIUM**

```typescript
const ALLOWED_ORIGINS = [
  'https://defrag.app',
  'https://www.defrag.app',
  'https://app.defrag.app',
  'https://sovereign.defrag.app',
  'https://premium.defrag.app',
  // Missing: 'https://sovv-web.<account>.workers.dev'
];
```

The `sovv-web` Worker is deployed to `workers.dev`. During development and staging, requests from the workers.dev URL will be rejected by CORS. Add the workers.dev URL or use a wildcard for `*.workers.dev` in non-production.

---

## 5. MEDIUM — subscription_updated_at Type Mismatch

**Status: 🟡 MEDIUM**

```sql
-- 002_subscription_status.sql
ALTER TABLE users ADD COLUMN subscription_updated_at INTEGER;
```

```typescript
// billing.ts — stores as ISO string
"UPDATE users SET subscription_updated_at = ? WHERE id = ?"
// Called with: new Date().toISOString()  ← string, not INTEGER
```

The column is typed `INTEGER` (Unix timestamp) but billing.ts writes ISO strings. SQLite will store it as text due to dynamic typing, but queries comparing as integer will break.

---

## 6. MEDIUM — No migrations_dir in wrangler.toml

**Status: 🟡 MEDIUM**

```toml
[[d1_databases]]
binding = "DB"
database_name = "vibesdk-db"
database_id = "c8c2fd8d-5297-46fc-8594-7629c8bad74d"
# Missing: migrations_dir = "migrations"
```

Without `migrations_dir`, `wrangler d1 migrations apply` won't know where to find migrations. Must be explicit.

---

## 7. LOW — 003_role.sql is a No-op

**Status: 🟢 LOW**

```sql
-- 003_role.sql
SELECT 1;
```

This migration does nothing. The `role` column is already in `0001_baseline.sql`. Safe to delete or replace with a comment-only file.

---

## FIXES TO APPLY

### Fix 1: Add sessions.token index (new migration)
### Fix 2: Add Access-Control-Allow-Credentials to CORS
### Fix 3: Add migrations_dir to wrangler.toml
### Fix 4: Fix subscription_updated_at type in billing.ts
### Fix 5: Rename migrations to consistent format

