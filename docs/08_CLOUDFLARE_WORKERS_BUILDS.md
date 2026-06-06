# Cloudflare Workers Builds Setup

## Status

**Required action:** Connect `sovv-web` Worker to Cloudflare Workers Builds (Git integration).

This replaces `.github/workflows/deploy-live.yml` as the production deployment path.

**Note on sovereign.os:** The `sovereign.os` domain is not currently in this Cloudflare account. Use `sovereign.defrag.app` as the transitional platform entry. When `sovereign.os` is registered and added to Cloudflare, make it the canonical platform landing and update DNS, routes, and email accordingly.

---

## Setup Steps

### 1. Remove defrag.app from Pages project

1. Cloudflare Dashboard → Workers & Pages → Pages → `sovv-platform`
2. Custom Domains → Remove `defrag.app`
3. Custom Domains → Remove `www.defrag.app`

### 2. Update DNS records

In the `defrag.app` zone (`45a59d754ece9221fc97c92c461eb01f`):

1. Delete the CNAME record for `defrag.app` pointing to `sovv-platform.pages.dev`
2. Delete the CNAME record for `www.defrag.app` pointing to `sovv-platform.pages.dev`
3. Add proxied A record: `defrag.app` → `192.0.2.1` (or AAAA `100::`)
4. Add proxied A record: `www.defrag.app` → `192.0.2.1` (or AAAA `100::`)

### 3. Deploy sovv-web Worker with full routes

```bash
cd apps/web
CLOUDFLARE_API_TOKEN=<token> wrangler deploy
```

Verify routes are active:
- `defrag.app/*` → `sovv-web`
- `www.defrag.app/*` → `sovv-web`
- `sovereign.defrag.app/*` → `sovv-web`
- `app.defrag.app/*` → `sovv-web`

### 4. Connect Cloudflare Workers Builds

1. Cloudflare Dashboard → Workers & Pages → `sovv-web`
2. Settings → Build & Deployments → Connect Git
3. Configure:

| Setting | Value |
|---|---|
| GitHub account | `defragapp` |
| Repository | `SOVV` |
| Branch | `main` |
| Build command | `cd apps/web && npx opennextjs-cloudflare build` |
| Output directory | `apps/web/.open-next` |
| Root directory | (leave empty) |

4. Add environment variables:

| Variable | Value |
|---|---|
| `JWT_SECRET` | (from Worker secrets) |
| `NEXT_PUBLIC_API_URL` | `https://api.defrag.app` |
| `NEXT_PUBLIC_AI_URL` | `https://ai.defrag.app` |

5. Save and trigger first build.

### 5. Verify deployment

- Visit `defrag.app` — should serve Sovereign.os platform landing
- Visit `app.defrag.app` — should serve authenticated app shell
- Visit `app.defrag.app/apps/defrag` — should serve Defrag space
- Check middleware is executing (test session redirect behavior)

### 6. Delete GitHub Actions deploy workflow

After Cloudflare Workers Builds is confirmed active:

```bash
git rm .github/workflows/deploy-live.yml
git commit -m "chore: remove deprecated GitHub Actions deploy workflow"
git push
```

### 7. Delete sovv-platform Pages project

After Worker routes are confirmed:

1. Cloudflare Dashboard → Workers & Pages → Pages → `sovv-platform`
2. Settings → Delete project

---

## Wrangler Manual Deploy (Fallback)

If Cloudflare Workers Builds is unavailable, deploy manually:

```bash
cd apps/web
npx opennextjs-cloudflare build
CLOUDFLARE_API_TOKEN=<token> wrangler deploy
```

---

## Worker Build Configuration Reference

`apps/web/wrangler.json`:
```json
{
  "name": "sovv-web",
  "main": "./.open-next/worker.js",
  "compatibility_date": "2026-06-04",
  "compatibility_flags": ["nodejs_compat"],
  "account_id": "8b1954d216d65077c6480d62583fe2c2",
  "workers_dev": false,
  "routes": [
    { "pattern": "defrag.app/*", "zone_id": "45a59d754ece9221fc97c92c461eb01f" },
    { "pattern": "www.defrag.app/*", "zone_id": "45a59d754ece9221fc97c92c461eb01f" },
    { "pattern": "sovereign.defrag.app/*", "zone_id": "45a59d754ece9221fc97c92c461eb01f" },
    { "pattern": "app.defrag.app/*", "zone_id": "45a59d754ece9221fc97c92c461eb01f" }
  ],
  "assets": {
    "directory": ".open-next/assets"
  }
}
```

`apps/web/open-next.config.ts`:
```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  middleware: {
    external: true,
    override: { wrapper: "cloudflare-edge" }
  }
});
```

---

## Email Routing Dashboard Tasks

See `docs/email-routing-standard.md` for full setup steps. Summary:

1. **Cloudflare Dashboard → Email → Email Routing → defrag.app zone**
   - Enable Email Routing (adds MX + SPF records automatically)
2. **Destination addresses** → Add and verify private forwarding address
3. **Routing rules** → Create rule: `info` → verified destination
4. **After verification** → Add `[[send_email]]` binding to `apps/worker/wrangler.toml`:
   ```toml
   [[send_email]]
   name = "EMAIL"
   destination_address = "info@defrag.app"
   ```
5. Redeploy `sovereign-os-api` after adding binding

---

## Remaining Dashboard Actions Checklist

| Action | Status |
|---|---|
| Remove `defrag.app` from Pages project `sovv-platform` | ⏳ Required |
| Remove `www.defrag.app` from Pages project `sovv-platform` | ⏳ Required |
| Update DNS: `defrag.app` CNAME → proxied Worker A/AAAA record | ⏳ Required |
| Update DNS: `www.defrag.app` CNAME → proxied Worker A/AAAA record | ⏳ Required |
| Connect `sovv-web` to Cloudflare Workers Builds (GitHub main) | ⏳ Required |
| Delete `sovv-platform` Pages project (after Worker routes verified) | ⏳ Required |
| Delete `.github/workflows/deploy-live.yml` (after Workers Builds confirmed) | ⏳ Required |
| Redeploy `sovereign-os-api` (KV binding renamed SOVV_DATA → KV) | ⏳ Required |
| Delete orphaned `sovv` Worker | ⏳ Required |
| Investigate/delete orphaned `BASELINE_KV` KV namespace | ⏳ Required |
| Enable Email Routing on `defrag.app` | ⏳ Required |
| Add and verify destination address for `info@defrag.app` | ⏳ Required |
| Add `[[send_email]]` binding to `sovereign-os-api` after verification | ⏳ Required |