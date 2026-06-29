# Merge blockers before production deploy

This branch can be reviewed as documentation and guardrails, but production deploy remains blocked.

## Blockers

- Exposed credentials must be revoked and rotated.
- The web deploy execution path must target production explicitly.
- Live Cloudflare route preservation must be verified before and after deploy.
- A web-only release path must not redeploy unrelated Workers.

## Non-blockers for this docs branch

- The resolved visual/routing incident does not require a product-code hotfix.
- `/studio` can remain as an isolated route.

## Required confirmation before deploy

- No pasted credentials are used.
- `sovv-web` is the only deploy target.
- Cloudflare routes remain unchanged.
- Unrelated Workers are untouched.
