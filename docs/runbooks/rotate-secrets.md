# Credential Rotation Runbook

Use this runbook when an access credential may have been exposed or when scheduled rotation is due.

## Rules

- Never paste credential values into chat, PRs, issues, commit messages, logs, or reports.
- Treat any credential pasted into chat, logs, shell history, or PR text as compromised.
- Rotate first, then update references and verification notes.
- Record only variable names and rotation status, never values.

## References

- `docs/cloudflare.md`
- `ops/cloudflare-inventory-2026-06-29.md`
- Cloudflare dashboard or API for current binding state

## Rotation steps

1. Identify the affected Worker and variable name.
2. Revoke or disable the old credential at the provider.
3. Create a replacement credential with least privilege.
4. Store the new value in the appropriate provider settings.
5. Re-run the relevant dry-run/build checks.
6. Verify the affected runtime path.
7. Document the rotation in the release or incident report.

## Verification

After rotation, confirm:

- The application path depending on the credential still works.
- No old value appears in code, docs, logs, or CI output.
- `node scripts/secret-scan.js` passes.
- The PR or incident report lists the variable name and status only.
