# Rollback Runbook

Use this runbook when a SOVV web release causes a production issue.

## Scope

This runbook covers rollback for `apps/web` / `sovv-web` only.

Do not modify unrelated Workers during a web rollback.

## First response

1. Confirm the affected route or page.
2. Capture the current branch, SHA, release time, and symptoms.
3. Check whether the issue is route/config drift, asset serving, runtime failure, or bad application code.
4. Avoid printing secret values in logs or reports.

## Preferred rollback path

Use Cloudflare's previous Worker version for `sovv-web` when available, then backfill the rollback state into Git.

Required after rollback:

- Verify routes are still attached.
- Verify `www.defrag.app`, `defrag.app`, and `app.defrag.app` behavior.
- Verify `_next/static` assets load.
- Open a follow-up PR documenting the rollback and permanent fix.

## Git rollback path

If rolling back through Git:

```bash
git checkout main
git pull
git revert <bad_commit_sha>
pnpm install --frozen-lockfile
pnpm run verify
cd apps/web
pnpm exec wrangler deploy --dry-run --env production --config wrangler.json
```

Only perform the real release after explicit authorization.

## Rollback report

Include:

1. Incident summary.
2. Bad release branch/SHA.
3. Rollback target version or SHA.
4. Checks run and results.
5. Cloudflare route verification.
6. Confirmation no unrelated Workers were touched.
7. Follow-up fix required.
