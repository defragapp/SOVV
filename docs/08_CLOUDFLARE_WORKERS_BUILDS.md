# Cloudflare Workers Builds Setup

## Status

**Required action:** Connect `sovv-web` Worker to Cloudflare Workers Builds (Git integration).

This replaces `.github/workflows/deploy-live.yml` as the production deployment path.

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