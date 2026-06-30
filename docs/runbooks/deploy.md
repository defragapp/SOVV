# Deploy Runbook

Use this runbook for authorized SOVV web releases.

## Scope

This runbook covers `apps/web` and the `sovv-web` Cloudflare Worker only.

Do not use this runbook to modify or release:

- `sovereign-os-api`
- `worker-ai`
- `worker-session`
- `sovereign-control`
- `developer`
- `sovereign-build-agent`
- `sovereign-code-agent`

## Preflight

1. Confirm the user has explicitly authorized a production web release.
2. Confirm the branch and SHA to release.
3. Review `ops/cloudflare-inventory-2026-06-29.md` for known route and binding drift.
4. Confirm no secret values are present in commits, logs, PR text, or shell transcripts.
5. Confirm CI has passed.

## Required checks

```bash
pnpm install --frozen-lockfile
node scripts/secret-scan.js
pnpm run verify
cd apps/web
pnpm exec wrangler deploy --dry-run --env production --config wrangler.json
```

## Release

Prefer the manual GitHub Actions workflow:

- `.github/workflows/deploy-sovv-web.yml`

If a trusted local release is explicitly authorized, run:

```bash
cd apps/web
CI=true pnpm exec wrangler deploy --env production --config wrangler.json
```

## Post-release verification

Verify live routes and these URLs:

- `https://www.defrag.app/`
- `https://www.defrag.app/campaign/sovereign-os`
- `https://www.defrag.app/product`
- `https://www.defrag.app/product/defrag`
- `https://www.defrag.app/product/alignment`
- `https://www.defrag.app/product/covenant`
- `https://www.defrag.app/pricing`

Expected copy includes:

- `You are not broken. You are patterned.`
- `The personal operating system`
- `Start with your baseline`

## Release report

Every release report must include:

1. Branch and SHA released.
2. Files changed.
3. Checks run and results.
4. Cloudflare Worker target.
5. Route verification result.
6. Secret-scan result.
7. Confirmation no unrelated Workers were touched.
8. Confirmation no secret values were printed.
9. Whether production release was performed.
