# sovv-web deploy script follow-up

The repository now has release guardrails and a dependency-free secret scanner, but the executable deploy-path change still needs a human-applied code change.

## Required change

Update web deploy execution so production targeting is explicit:

```bash
cd apps/web && npx wrangler deploy --env production --config wrangler.json
```

Avoid plain `npx wrangler deploy` for production web deploys.

## Files to review

- `apps/web/scripts/deploy.sh`
- `.github/workflows/deploy.yml`
- `.github/workflows/deploy-sovv-web.yml`
- `apps/web/wrangler.json`

## Current risk

A web release is not fully release-ready while any production deploy path still delegates to plain `wrangler deploy` or while route preservation is not confirmed against live Cloudflare state.

## Required route verification

Before deployment, verify live Cloudflare routes for `sovv-web`:

- `defrag.app/*`
- `www.defrag.app/*`
- `app.defrag.app/*`
- `sovereign.defrag.app/*`
- `*defrag.app/_next/static/*`

Some live routes may be dashboard-managed rather than represented in `apps/web/wrangler.json`. Keep deploy blocked until route preservation is confirmed in Cloudflare.

## Required security verification

Before any real deploy:

1. Revoke and rotate any credential pasted into chat, logs, shell history, issues, or PRs.
2. Store replacements only in GitHub or Cloudflare managed secrets.
3. Run `node scripts/secret-scan.js`.
4. Confirm no secret values are printed.
5. Confirm the deploy target is `sovv-web` only.

No production deploy should be performed from this follow-up doc.
