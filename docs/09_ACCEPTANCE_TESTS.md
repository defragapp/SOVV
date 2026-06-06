# Acceptance Tests

Run these checks before any production release to verify platform alignment.

---

## 1. Deployment Verification

```bash
# Verify sovv-web Worker is serving all four domains
curl -I https://defrag.app | grep -E "cf-worker|server"
curl -I https://www.defrag.app | grep -E "cf-worker|server"
curl -I https://sovereign.defrag.app | grep -E "cf-worker|server"
curl -I https://app.defrag.app | grep -E "cf-worker|server"

# Verify Pages project is NOT serving defrag.app
curl -I https://defrag.app | grep -v "pages.dev"

# Verify API Worker is reachable
curl -s https://api.defrag.app/health | head -5

# Verify AI Worker is reachable
curl -I https://ai.defrag.app | grep -E "200|404"
```

---



```bash
cd /path/to/SOVV

# Check for DEFRAG in body copy (should only appear in titles/metadata/headers)
echo "=== DEFRAG in body copy ==="
grep -rn '"DEFRAG\|>DEFRAG\| DEFRAG ' apps/web/app/ apps/web/components/ apps/web/data/ \
  | grep -v "title:\|metadata\|eyebrow\|SOVEREIGN\|// " \
  | grep -v "node_modules"

# Check for Workbench in user-facing copy
echo "=== Workbench in user-facing copy ==="
grep -rn "Workbench\|WORKBENCH" apps/web/app/ apps/web/components/ apps/web/data/

# Check for "Your Baseline" without "Design" in user-facing copy
echo "=== Your Baseline without Design ==="
grep -rn "Your Baseline[^D]" apps/web/app/ apps/web/components/ apps/web/data/ \
  | grep -v "node_modules"

# Check for "workspace" where "space" is required
echo "=== workspace in user-facing copy ==="
grep -rn "ENTER WORKBENCH\|Enter Workspace\|Open Workspace\|Go to Workspace\|workspace tier" \
  apps/web/app/ apps/web/components/

# Check for duplicate app root
echo "=== Duplicate app root check ==="
ls apps/web/src/ 2>/dev/null && echo "ERROR: src/ exists — delete it" || echo "OK: no src/"

# Check for committed sensitive files
echo "=== Sensitive files check ==="
git ls-files | grep -E "cookies\.txt|\.log$|\.pid$|wrangler\.log|cf_audit"
```

---

## 3. Platform Hierarchy Checks

```bash
# Verify /apps/defrag route exists
ls apps/web/app/apps/defrag/page.tsx && echo "OK: Defrag space route exists"

# Verify /apps/covenant route exists
ls apps/web/app/apps/covenant/page.tsx && echo "OK: Covenant space route exists"

# Verify marketing shell header is SOVEREIGN.OS not DEFRAG
grep -n "SOVEREIGN.OS\|DEFRAG" apps/web/components/marketing/site-shell.tsx | head -5

# Verify login button is not ENTER WORKBENCH
grep -n "WORKBENCH\|SOVEREIGN.OS" apps/web/app/login/page.tsx
```

---

## 4. D1 Schema Verification

```bash
# Verify library table exists in live D1
CLOUDFLARE_API_TOKEN=<token> npx wrangler d1 execute vibesdk-db --remote \
  --command "SELECT name FROM sqlite_master WHERE type='table' AND name='library';"

# Verify all required tables exist
CLOUDFLARE_API_TOKEN=<token> npx wrangler d1 execute videsdk-db --remote \
  --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

Expected tables: `users`, `sessions`, `interactions`, `patterns`, `people`, `promo_codes`, `support_tickets`, `subscriptions`, `stripe_prices`, `library`, `ai_conversations`

---

## 5. KV Binding Verification

```bash
# Verify wrangler.toml uses binding = "KV" (not SOVV_DATA)
grep "binding" apps/worker/wrangler.toml | grep -E "KV|SOVV"

# Verify source code uses env.KV (not env.SOVV_DATA)
grep -rn "env\.SOVV_DATA" apps/worker/src/ && echo "ERROR: SOVV_DATA binding mismatch" || echo "OK: KV binding consistent"
```

---

## 6. Build Verification

```bash
cd apps/web

# Verify OpenNext build produces correct artifacts
npm run build:worker
ls .open-next/worker.js && echo "OK: worker.js exists"
ls .open-next/assets/ && echo "OK: assets/ exists"

# Verify no src/ directory
ls src/ 2>/dev/null && echo "ERROR: src/ exists" || echo "OK: no src/"
```

---

## 7. Workflow Verification

```bash
# Verify fix-lockfile.yml is deleted
ls .github/workflows/fix-lockfile.yml 2>/dev/null && echo "ERROR: fix-lockfile.yml exists" || echo "OK: deleted"

# Verify deploy-live.yml is deprecated (commented out)
grep -c "^#" .github/workflows/deploy-live.yml | xargs -I{} echo "Commented lines: {}"
```

---

## 8. Entitlement Security Check

```bash
# Verify no client-trusted tier logic
grep -rn "tier.*localStorage\|tier.*cookie\|setTier.*body\|tier.*param" \
  apps/web/app/ apps/web/components/ | grep -v "node_modules"

# Verify tier is always fetched from server
grep -rn "api/auth/tier" apps/web/app/ apps/web/components/ | head -5
```

---

## Pass Criteria

| Check | Pass Condition |
|---|---|
| All four domains served by Worker | No `pages.dev` in response headers |
| No DEFRAG in body copy | Zero matches outside titles/metadata |
| No Workbench in user-facing copy | Zero matches |
| No "got lit up" in body copy | Zero matches in marketing/docs prose |
| Baseline Design used in user-facing copy | "Baseline Design" appears in settings, components, emails |
| `/apps/defrag` route exists | File present |
| `/apps/covenant` route exists | File present |
| Marketing shell header | "SOVEREIGN.OS" not "DEFRAG" |
| Login button | "ENTER SOVEREIGN.OS" not "ENTER WORKBENCH" |
| `library` table in live D1 | Table present |
| KV binding consistent | `binding = "KV"` in toml, `env.KV` in source |
| No `src/` directory | Directory absent |
| `fix-lockfile.yml` deleted | File absent |
| No sensitive files committed | Zero matches |
| Build produces `.open-next/worker.js` | File present after build |
| No `privacy@defrag.app` or `legal@defrag.app` in user-facing copy | Zero matches |
| `info@defrag.app` is primary contact | Appears in contact, privacy, terms, email.ts |
| No `sovereign.os` or `covenant.app` email addresses in docs/UI | Zero matches (except future-state comments) |