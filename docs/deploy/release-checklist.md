# SOVV web release checklist

Use this checklist before deploying `apps/web` to the Cloudflare Worker `sovv-web`.

## Release status labels

Use one of these statuses in reports:

- `ready for review`
- `ready for merge`
- `ready for deploy`
- `deploy blocked`
- `needs patch handoff`
- `needs credential rotation`
- `incident resolved`

## Pre-deploy GitHub checks

- [ ] Intended branch or SHA is verified.
- [ ] Intended PR is merged or explicitly approved for deployment.
- [ ] Changed files are reviewed.
- [ ] No unrelated Worker code is included.
- [ ] No auth, billing, database, or AI prompt changes are included unless explicitly in scope.
- [ ] CI/check status is reviewed.
- [ ] Secret scan passes.
- [ ] No pasted credentials are used.
- [ ] Any previously exposed credentials have been revoked and rotated.

## Pre-deploy Cloudflare checks

- [ ] Active `sovv-web` version is recorded.
- [ ] Latest deployment timestamp is recorded.
- [ ] Expected next version is recorded.
- [ ] Live route set is recorded.
- [ ] Production secrets are present by name only.
- [ ] Required bindings are present by name only.
- [ ] No secret values are printed.
- [ ] Unrelated Workers are listed and marked out of scope.

## Required `sovv-web` live route baseline

These routes must remain mapped to `sovv-web` after any web deploy:

- `defrag.app/*`
- `www.defrag.app/*`
- `app.defrag.app/*`
- `sovereign.defrag.app/*`
- `*defrag.app/_next/static/*`

Important: some live routes may be Cloudflare dashboard-managed rather than represented in `apps/web/wrangler.json`. Always verify route preservation against Cloudflare before and after deploy.

## Workers out of scope for web deploys

Do not touch these Workers during a web-only deploy:

- `sovereign-os-api`
- `worker-ai`
- `worker-session`
- `sovereign-control`

## Required web checks

Run these before a real deploy:

```bash
node scripts/secret-scan.js
npm run -w apps/web lint
npx tsc -p apps/web/tsconfig.json --noEmit
npm --workspace apps/web run build
cd apps/web && npx @opennextjs/cloudflare build
cd apps/web && npx wrangler deploy --dry-run --env production --config wrangler.json
git diff --check
```

Do not run a real deploy until all release gates pass and the user explicitly authorizes production deployment.

## Deploy command

The web deploy must target production explicitly:

```bash
cd apps/web && npx wrangler deploy --env production --config wrangler.json
```

Avoid plain `wrangler deploy` for production web deploys because it leaves the target environment ambiguous.

## Post-deploy Cloudflare verification

- [ ] `sovv-web` version increased from the baseline.
- [ ] Latest deployment timestamp updated.
- [ ] Route mapping remained unchanged.
- [ ] `sovereign-os-api` was not touched.
- [ ] `worker-ai` was not touched.
- [ ] `worker-session` was not touched.
- [ ] `sovereign-control` was not touched.
- [ ] No secret values were printed.

## Post-deploy live content verification

Verify these routes return expected content:

- `https://www.defrag.app/`
- `https://www.defrag.app/campaign/sovereign-os`
- `https://www.defrag.app/product`
- `https://www.defrag.app/product/defrag`
- `https://www.defrag.app/product/alignment`
- `https://www.defrag.app/product/covenant`
- `https://www.defrag.app/pricing`

Expected homepage/campaign copy includes:

- `You are not broken. You are patterned.`
- `The personal operating system`
- `Start with your baseline`
- `Product spaces`
- `Defrag`
- `Alignment`
- `Covenant`
- `Baseline`

## Visual incident closeout

If a live visual/routing incident is reported:

1. Verify live public routes first.
2. Compare root, `/studio`, campaign, product, and pricing routes.
3. Check for stale cache or Cloudflare edge propagation before changing code.
4. Do not deploy a hotfix if live state is already correct.
5. If credential values were pasted during triage, close the visual incident separately and open a security rotation blocker.

## Security blocker

Deploy is blocked if any live-looking token or secret was pasted into chat, command logs, shell history, PRs, issues, or docs.

Before deploy:

- [ ] Exposed GitHub PATs are revoked.
- [ ] Exposed Cloudflare API tokens are revoked.
- [ ] Replacement tokens are created with least privilege.
- [ ] Replacement tokens are stored only as managed secrets.
- [ ] Secret scan passes after rotation.
