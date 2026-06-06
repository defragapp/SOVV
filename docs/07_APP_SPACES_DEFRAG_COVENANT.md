# App Spaces — Defrag and Covenant

## Architecture

Both Defrag and Covenant are spaces inside Sovereign.os. They share:
- One user account
- One auth/session system (`sovereign-os-api`)
- One Baseline Design (stored in KV)
- One Library (D1 `library` table, `workspace_source` column distinguishes space)
- One subscription/entitlement system (D1 `users.tier`)
- One invite/permission system
- One Owner/Ambassador admin system

---

## Space Routes

| Route | Space | File |
|---|---|---|
| `/apps/defrag` | Defrag space | `apps/web/app/apps/defrag/page.tsx` |
| `/apps/covenant` | Covenant space | `apps/web/app/apps/covenant/page.tsx` |

The authenticated app shell at `app.defrag.app` routes to `/apps/defrag` by default.

---

## Defrag Space

**Purpose:** Relational intelligence. Shows what got lit up, where the loop is forming, and what response gives the moment a better chance.

**Entry point:** `apps/web/app/apps/defrag/page.tsx`

**Shell component:** `apps/web/components/workspace/Shell.tsx`

**API routes used:**
- `GET /api/baseline` — load Baseline Design
- `POST /api/explain` — AI analysis (self or relational mode)
- `GET /api/chips` — suggested prompts
- `GET /api/history` — session history
- `POST /api/history` — save to Library with `workspace_source: "DEFRAG"`
- `GET /api/patterns` — extracted behavioral patterns
- `GET /api/auth/tier` — subscription tier check

**Library save:** `workspace_source: "DEFRAG"`

---

## Covenant Space

**Purpose:** Optional faith-context reflection. User-initiated, plain-language, private by design.

**Entry point:** `apps/web/app/apps/covenant/page.tsx`

**API routes used:**
- `GET /api/baseline` — load shared Baseline Design
- `POST /api/covenant` — Covenant AI analysis
- `POST /api/history` — save to Library with `workspace_source: "COVENANT"`
- `GET /api/auth/tier` — subscription tier check (Pro required for Covenant)

**Library save:** `workspace_source: "COVENANT"`

**AI system prompt:** `apps/worker/src/covenant.ts` — `SYSTEM_COVENANT`

---

## Library Schema

```sql
CREATE TABLE library (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    workspace_source TEXT NOT NULL CHECK(workspace_source IN ('DEFRAG', 'COVENANT')),
    title TEXT,
    payload JSON,
    is_public INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

The `workspace_source` column is an internal identifier. In user-facing copy, use "Defrag space" and "Covenant space" — not "DEFRAG" or "COVENANT".

---

## Adding a New Space

When adding a new space to Sovereign.os:

1. Create `apps/web/app/apps/{space-name}/page.tsx`
2. Use shared auth: `fetch("/api/auth/tier", { credentials: "include" })`
3. Use shared Baseline Design: `fetch("/api/baseline", { credentials: "include" })`
4. Save to shared Library: `POST /api/history` with `workspace_source: "{SPACE_NAME}"`
5. Add `workspace_source` value to D1 `library` table CHECK constraint via migration
6. Add space route to middleware if host-based routing is needed
7. Add space to the Sovereign.os landing page (`apps/web/app/page.tsx`)
8. Document the space in `docs/07_APP_SPACES_DEFRAG_COVENANT.md`
9. Do NOT create separate auth, subscription, Baseline Design, Library, or invite systems

---

## Subscription Gating

| Feature | Free | Pro |
|---|---|---|
| Defrag space access | ✅ | ✅ |
| Baseline Design setup | ✅ | ✅ |
| What got lit up | ✅ | ✅ |
| Best Next Response | ✅ | ✅ |
| Basic session history | ✅ | ✅ |
| 5 sessions/day limit | ✅ | — |
| Unlimited sessions | — | ✅ |
| Your Story (full history) | — | ✅ |
| Compare With Someone | — | ✅ |
| Try It Out | — | ✅ |
| Audio summaries | — | ✅ |
| Watch It | — | ✅ |
| Covenant space | — | ✅ |
| Priority processing | — | ✅ |