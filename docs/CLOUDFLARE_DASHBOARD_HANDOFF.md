# Cloudflare Dashboard / Cloudflare AI Handoff

This document lists every task that cannot be completed from the repository or via the Cloudflare API with the current token scope. Each item includes the exact Cloudflare area, current state, desired state, click-by-click actions, validation check, and whether it must be done manually.

---

## TASK 1 — Remove defrag.app from Pages project

| Field | Value |
|---|---|
| **Task name** | Remove defrag.app and www.defrag.app from sovv-platform Pages project |
| **Cloudflare area** | Workers & Pages → Pages → sovv-platform → Custom Domains |
| **Current state** | `defrag.app` and `www.defrag.app` are custom domains on the `sovv-platform` Pages project. DNS CNAMEs point to `sovv-platform.pages.dev`. The Next.js middleware is NOT executing for these domains. |
| **Desired state** | `defrag.app` and `www.defrag.app` are owned by the `sovv-web` Worker. DNS records point to proxied Worker A/AAAA records. |
| **Click-by-click** | 1. Dashboard → Workers & Pages → Pages tab → `sovv-platform` → Settings → Custom Domains<br>2. Click the `...` menu next to `defrag.app` → Remove<br>3. Click the `...` menu next to `www.defrag.app` → Remove<br>4. Confirm removal |
| **Validation** | Custom Domains list for `sovv-platform` shows no entries |
| **Manual?** | ✅ Yes — must be done in dashboard |

---

## TASK 2 — Update DNS records for defrag.app and www.defrag.app

| Field | Value |
|---|---|
| **Task name** | Change defrag.app and www.defrag.app DNS from Pages CNAME to Worker A/AAAA records |
| **Cloudflare area** | DNS → defrag.app zone → Records |
| **Current state** | `defrag.app` CNAME → `sovv-platform.pages.dev` (proxied). `www.defrag.app` CNAME → `sovv-platform.pages.dev` (proxied). |
| **Desired state** | `defrag.app` A → `192.0.2.1` (proxied) or AAAA → `100::` (proxied). Same for `www.defrag.app`. |
| **Click-by-click** | 1. Dashboard → DNS → defrag.app zone → Records<br>2. Find CNAME record for `defrag.app` → Edit → Change Type to A → Value: `192.0.2.1` → Proxy: ON → Save<br>3. Find CNAME record for `www.defrag.app` → Edit → Change Type to A → Value: `192.0.2.1` → Proxy: ON → Save<br>4. Alternatively: Delete both CNAMEs and add new A records |
| **Validation** | `curl -I https://defrag.app` returns `cf-worker` header, not `pages.dev` |
| **Manual?** | ✅ Yes — must be done in dashboard |

---

## TASK 3 — Connect sovv-web to Cloudflare Workers Builds

| Field | Value |
|---|---|
| **Task name** | Enable Cloudflare Workers Builds (Git integration) for sovv-web |
| **Cloudflare area** | Workers & Pages → Workers → sovv-web → Settings → Build & Deployments |
| **Current state** | `sovv-web` is deployed via GitHub Actions (`deploy-live.yml`, now deprecated). No Cloudflare Workers Builds connection exists. |
| **Desired state** | `sovv-web` builds and deploys automatically from GitHub `main` branch via Cloudflare Workers Builds. |
| **Click-by-click** | 1. Dashboard → Workers & Pages → sovv-web → Settings → Build & Deployments<br>2. Click **Connect Git**<br>3. Authorize GitHub → select `defragapp/SOVV`<br>4. Branch: `main`<br>5. Build command: `cd apps/web && npx opennextjs-cloudflare build`<br>6. Output directory: `apps/web/.open-next`<br>7. Root directory: (leave empty)<br>8. Add environment variables:<br>   - `JWT_SECRET` (secret)<br>   - `NEXT_PUBLIC_API_URL` = `https://api.defrag.app`<br>   - `NEXT_PUBLIC_AI_URL` = `https://ai.defrag.app`<br>9. Save and trigger first build |
| **Validation** | Build succeeds. `defrag.app` serves the Sovereign.os platform landing. Middleware executes (test session redirect). |
| **Manual?** | ✅ Yes — must be done in dashboard |

---

## TASK 3b — Connect sovereign-os-api to Cloudflare Workers Builds

| Field | Value |
|---|---|
| **Task name** | Enable Cloudflare Workers Builds (Git integration) for sovereign-os-api |
| **Cloudflare area** | Workers & Pages → Workers → sovereign-os-api → Settings → Build & Deployments |
| **Current state** | `sovereign-os-api` is deployed manually via Wrangler from Codespaces. No Cloudflare Workers Builds connection exists. |
| **Desired state** | `sovereign-os-api` builds and deploys automatically from GitHub `main` branch via Cloudflare Workers Builds. No Codespaces terminal required. |
| **Click-by-click** | 1. Dashboard → Workers & Pages → sovereign-os-api → Settings → Build & Deployments<br>2. Click **Connect Git**<br>3. Authorize GitHub → select `defragapp/SOVV`<br>4. Branch: `main`<br>5. Root directory: `apps/worker`<br>6. Build command: `npm install`<br>7. Deploy command: `npx wrangler deploy`<br>8. Node version: `22`<br>9. Save and trigger first build |
| **Validation** | `GET https://api.defrag.app/health` returns `{ "ok": true, "service": "sovereign-os-api" }` |
| **Notes** | Node 22+ required. `itty-router` and all dependencies are committed in `package-lock.json`. KV binding is `KV` (maps to SOVV_DATA namespace). |
| **Manual?** | ✅ Yes — must be done in dashboard |

---

## TASK 4 — Delete sovv-platform Pages project

| Field | Value |
|---|---|
| **Task name** | Delete the sovv-platform Cloudflare Pages project |
| **Cloudflare area** | Workers & Pages → Pages → sovv-platform → Settings |
| **Current state** | `sovv-platform` Pages project exists and was previously serving `defrag.app`. |
| **Desired state** | Pages project deleted. No Pages project serves product runtime. |
| **Click-by-click** | 1. Complete TASK 1 and TASK 2 first<br>2. Verify `defrag.app` is served by Worker (TASK 3 validation)<br>3. Dashboard → Workers & Pages → Pages → `sovv-platform` → Settings → Delete project<br>4. Type project name to confirm → Delete |
| **Validation** | `sovv-platform` no longer appears in Pages list |
| **Manual?** | ✅ Yes — must be done in dashboard. Do NOT do this before TASK 1–3 are complete. |

---

## TASK 5 — Redeploy sovereign-os-api (KV binding rename)

| Field | Value |
|---|---|
| **Task name** | Redeploy sovereign-os-api after KV binding rename |
| **Cloudflare area** | Terminal / Wrangler (can be done from Codespace) |
| **Current state** | `sovereign-os-api` was last deployed with `binding = "SOVV_DATA"`. The `wrangler.toml` now declares `binding = "KV"`. The live worker may still reference the old binding name. |
| **Desired state** | `sovereign-os-api` deployed with `binding = "KV"` matching source code `env.KV` references. |
| **Click-by-click** | From Codespace terminal:<br>`cd apps/worker && wrangler deploy` |
| **Validation** | `wrangler tail sovereign-os-api` shows no KV binding errors. `/api/baseline` returns valid response. |
| **Manual?** | ✅ Yes — run from Codespace or terminal with valid `CLOUDFLARE_API_TOKEN` |

---

## TASK 6 — Delete orphaned sovv Worker

| Field | Value |
|---|---|
| **Task name** | Delete the orphaned `sovv` Worker |
| **Cloudflare area** | Workers & Pages → Workers → sovv |
| **Current state** | Worker named `sovv` exists with no routes, no repo config, and no active traffic. It has `fetch`, `queue`, and `email` handlers but is unreachable. |
| **Desired state** | Worker deleted. |
| **Click-by-click** | 1. Dashboard → Workers & Pages → Workers → `sovv`<br>2. Settings → Delete Worker<br>3. Confirm deletion |
| **Validation** | `sovv` no longer appears in Workers list |
| **Manual?** | ✅ Yes — must be done in dashboard |

---

## TASK 7 — Enable Email Routing on defrag.app

| Field | Value |
|---|---|
| **Task name** | Enable Cloudflare Email Routing on defrag.app zone |
| **Cloudflare area** | Email → Email Routing → defrag.app |
| **Current state** | Email Routing is not enabled on `defrag.app`. MX records exist (Cloudflare Email Routing MX) but Email Routing may not be active. |
| **Desired state** | Email Routing enabled. `info@defrag.app` routes to verified destination. |
| **Click-by-click** | 1. Dashboard → Email → Email Routing<br>2. Select zone: `defrag.app`<br>3. Click **Get started** or **Enable Email Routing**<br>4. Cloudflare adds MX + SPF records automatically — confirm they are active<br>5. Email Routing → **Destination addresses** → **Add destination address**<br>6. Enter private forwarding address (do NOT commit to repo)<br>7. Verify destination via confirmation email<br>8. Email Routing → **Routing rules** → **Create address**<br>9. Custom address: `info` → Action: Send to email → select verified destination → Save |
| **Validation** | Send test email to `info@defrag.app` → arrives at verified destination |
| **Manual?** | ✅ Yes — must be done in dashboard |

---

## TASK 8 — Add send_email binding to sovereign-os-api

| Field | Value |
|---|---|
| **Task name** | Add Cloudflare send_email binding after Email Routing is verified |
| **Cloudflare area** | Terminal / Wrangler + wrangler.toml |
| **Current state** | `send_email` binding is NOT in `apps/worker/wrangler.toml`. Email is sent via Resend API fallback. |
| **Desired state** | `[[send_email]]` binding added to `wrangler.toml`. `sovereign-os-api` uses Cloudflare native email as primary path. |
| **Prerequisite** | TASK 7 must be complete and destination verified |
| **Click-by-click** | 1. Add to `apps/worker/wrangler.toml`:<br>```toml<br>[[send_email]]<br>name = "EMAIL"<br>destination_address = "info@defrag.app"<br>```<br>2. Commit and push (or run `wrangler deploy` from Codespace)<br>3. Verify `env.EMAIL` is available in Worker |
| **Validation** | Trigger a test billing event → email arrives via Cloudflare (not Resend). Check Worker logs for send path. |
| **Manual?** | ✅ Partial — wrangler.toml edit can be done in repo; deploy requires Codespace or CI |

---

## TASK 9 — Investigate orphaned BASELINE_KV namespace

| Field | Value |
|---|---|
| **Task name** | Investigate and clean up orphaned BASELINE_KV KV namespace |
| **Cloudflare area** | Workers & Pages → KV |
| **Current state** | KV namespace `BASELINE_KV` (id: `c9155ffd7355462babf222bfabd2588f`) exists in the account but is not referenced in any `wrangler.toml`. |
| **Desired state** | Namespace deleted if empty, or documented and bound if it contains live data. |
| **Click-by-click** | 1. Dashboard → Workers & Pages → KV → `BASELINE_KV`<br>2. Check key count — if 0 keys, safe to delete<br>3. If keys exist, inspect them to determine if they are live Baseline Design data<br>4. If empty: Settings → Delete namespace<br>5. If live data: add binding to appropriate worker and document |
| **Validation** | `BASELINE_KV` either deleted or properly bound and documented |
| **Manual?** | ✅ Yes — must be done in dashboard |

---

## TASK 10 — Register sovereign.os and add to Cloudflare (Future)

| Field | Value |
|---|---|
| **Task name** | Register sovereign.os domain and add zone to Cloudflare |
| **Cloudflare area** | Registrar or external registrar → Cloudflare DNS → Add zone |
| **Current state** | `sovereign.os` is not registered or not in this Cloudflare account. `sovereign.defrag.app` is used as a temporary platform entry. |
| **Desired state** | `sovereign.os` is the canonical Sovereign.os platform landing. `app.sovereign.os` is the authenticated app shell. |
| **Click-by-click** | 1. Register `sovereign.os` via Cloudflare Registrar or external registrar<br>2. Dashboard → Add a Site → `sovereign.os`<br>3. Add DNS records: A `sovereign.os` → `192.0.2.1` (proxied), A `app.sovereign.os` → `192.0.2.1` (proxied)<br>4. Add routes to `apps/web/wrangler.json` (see `docs/02_ROUTE_OWNERSHIP.md`)<br>5. Enable Email Routing on `sovereign.os` → add `info@sovereign.os` routing rule<br>6. Update transactional email From to `Sovereign.os <info@sovereign.os>`<br>7. Redirect `sovereign.defrag.app` → `sovereign.os`<br>8. Update middleware to handle `sovereign.os` and `app.sovereign.os` hosts |
| **Validation** | `sovereign.os` serves Sovereign.os platform landing. `app.sovereign.os` serves authenticated app shell. |
| **Manual?** | ✅ Yes — requires domain registration and Cloudflare zone setup |

---

## TASK 11 — Delete or document sovereign-build-agent and sovereign-code-agent Workers

| Field | Value |
|---|---|
| **Task name** | Resolve orphaned AI agent Workers |
| **Cloudflare area** | Workers & Pages → Workers |
| **Current state** | `sovereign-build-agent` and `sovereign-code-agent` exist with no routes, no repo config, deployed via API. |
| **Desired state** | Either deleted (if no longer needed) or given repo source configs and documented. |
| **Click-by-click** | If deleting: Dashboard → Workers → `sovereign-build-agent` → Settings → Delete. Repeat for `sovereign-code-agent`.<br>If keeping: Create `apps/worker-build-agent/` and `apps/worker-code-agent/` with `wrangler.toml` and source. |
| **Validation** | Workers either absent from list or have repo source of truth |
| **Manual?** | ✅ Yes — must be done in dashboard or Codespace |

---

## Summary Table

| # | Task | Area | Priority | Manual? |
|---|---|---|---|---|
| 1 | Remove defrag.app from Pages project | Pages → sovv-platform | 🔴 Blocking | ✅ |
| 2 | Update DNS records (CNAME → Worker A/AAAA) | DNS → defrag.app | 🔴 Blocking | ✅ |
| 3 | Connect sovv-web to Workers Builds | Workers → sovv-web | 🔴 Blocking | ✅ |
| 3b | Connect sovereign-os-api to Workers Builds | Workers → sovereign-os-api | 🔴 Blocking | ✅ |
| 4 | Delete sovv-platform Pages project | Pages | 🔴 After 1–3 | ✅ |
| 5 | Redeploy sovereign-os-api (KV binding rename) | Terminal/Wrangler | 🟡 High | ✅ |
| 6 | Delete orphaned sovv Worker | Workers | 🟡 High | ✅ |
| 7 | Enable Email Routing on defrag.app | Email Routing | 🟡 High | ✅ |
| 8 | Add send_email binding | wrangler.toml + deploy | 🟡 After 7 | Partial |
| 9 | Investigate BASELINE_KV namespace | KV | 🟢 Medium | ✅ |
| 10 | Register sovereign.os + add to Cloudflare | Registrar + DNS | 🟢 Future | ✅ |
| 11 | Delete/document AI agent Workers | Workers | 🟢 Low | ✅ |