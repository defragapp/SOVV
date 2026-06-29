# Visual incident closeout — 2026-06-29

## Verdict

The reported visual/routing issue is considered resolved based on live route triage. No visual hotfix was needed.

## Observed resolution

Live verification reported that the expected Sovereign.os homepage, campaign, product, and pricing routes were serving expected content. `/studio` remained isolated as its own route and no root-to-studio redirect was found.

## Likely explanation

The most likely causes of the temporary mismatch were one or more of:

- stale browser cache
- Cloudflare edge cache
- transient deploy propagation
- stale Worker/version observation during a deployment window

## No product-code action

No product-code hotfix should be created solely for this resolved visual report.

## Security follow-up

The triage transcript included live-looking credential values. Treat any token pasted into chat, shell commands, logs, issue text, or PR text as compromised.

Before any future production deploy:

1. Revoke exposed GitHub tokens.
2. Revoke exposed Cloudflare API tokens.
3. Create replacement tokens with least privilege.
4. Store replacements only in managed secrets.
5. Run `node scripts/secret-scan.js`.
6. Confirm no secret values are printed.

## Deploy status

Production deploy remains blocked until credential rotation is confirmed and the release checklist gates pass.
