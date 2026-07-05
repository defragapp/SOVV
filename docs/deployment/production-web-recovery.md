# Production Web Recovery

## Problem

Production is serving an older Defrag-branded web deployment while the repository contains the newer Sovereign.os web surface in `apps/web`.

Legacy indicators that should not appear on production:

- `You know what you meant. Defrag shows you what they may have heard.`
- `Sends to chadowen93@gmail.com`
- `Return to your relational workspace`

Current production indicators that should appear on the public web surface:

- `Sovereign.os`
- `Baseline Design`
- `Pattern-aware AI` / `pattern-aware AI`

## Expected Cloudflare ownership

| Hostname | Expected owner | Notes |
| --- | --- | --- |
| `defrag.app` | `sovv-web-production` web Worker or intentional redirect to same current build | Must not serve legacy Defrag build |
| `www.defrag.app` | `sovv-web-production` web Worker | Primary public marketing surface |
| `app.defrag.app` | `sovv-web-production` web Worker | Auth/app shell surface |
| `sovereign.defrag.app` | `sovv-web-production` web Worker | Sovereign branded surface/alias |
| `api.defrag.app` | `sovereign-os-api` API Worker | Must remain separate from web Worker |

## Repo-side deployment config

The web app uses OpenNext for Cloudflare Workers.

The deployment config lives at:

```txt
apps/web/wrangler.jsonc
```

The deploy script lives at:

```txt
apps/web/scripts/deploy.sh
```

The production deploy command is:

```sh
cd apps/web
pnpm run deploy
```

That command builds the OpenNext output and deploys it through the OpenNext Cloudflare adapter.

## Cloudflare dashboard checks

Before deploying, verify the current Cloudflare routing state:

1. Workers & Pages → confirm which object owns `defrag.app`.
2. Workers & Pages → confirm which object owns `www.defrag.app`.
3. Workers & Pages → confirm which object owns `app.defrag.app`.
4. Workers & Pages → confirm which object owns `sovereign.defrag.app`.
5. Workers & Pages → confirm `api.defrag.app` remains on `sovereign-os-api`.
6. DNS → confirm hostnames are proxied through Cloudflare.
7. Rules → confirm no redirect rule sends current domains to a legacy project.
8. Pages projects → detach legacy custom domains from any old Defrag project.
9. Workers routes/custom domains → attach web hostnames to `sovv-web-production`.
10. Cache → purge affected hostnames after routing is corrected.

Do not delete legacy Pages/Worker projects until traffic ownership is confirmed.

## Verification

Run the live stale-page smoke check:

```sh
pnpm verify:production-web
```

Optionally check additional domains:

```sh
PRODUCTION_WEB_URLS="https://defrag.app/,https://www.defrag.app/,https://app.defrag.app/,https://sovereign.defrag.app/" pnpm verify:production-web
```

Manual browser checks:

- Open `https://defrag.app/?verify=current-build` in a private window.
- Open `https://www.defrag.app/?verify=current-build` in a private window.
- Confirm the page is the current Sovereign.os landing page.
- Confirm the old Defrag headline is gone.
- Confirm `https://api.defrag.app/health` still responds from the API Worker.

## Rollback

If the new web Worker breaks production:

1. Reattach the previous web Worker/Pages project to the public domains.
2. Purge Cloudflare cache for affected hostnames.
3. Re-run `pnpm verify:production-web` and document whether rollback restored the old or current surface.
4. Open a fix-forward PR before attempting another production deploy.

## Release guardrail

The `Production web smoke` workflow runs on a schedule and can also be triggered manually. It fails when legacy copy is detected or when current Sovereign.os copy is missing.
