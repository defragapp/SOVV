## Sovereign.os Environment

### Binding Names (used in code via `env.*`)
- `env.DB` → D1 database `vibesdk-db`
- `env.KV` → KV namespace `SOVV_DATA`
- `env.R2` → R2 bucket `vibesdk-templates`

### Resource IDs
- D1: `c8c2fd8d-5297-46fc-8594-7629c8bad74d`
- KV: `3bd3ff5048a8468e82c574d7d66045c3`

### Local Development
- Run `npx wrangler dev` from `apps/worker/`
- Secrets are loaded from `.dev.vars` (gitignored)
- Do NOT commit API tokens to the repository.

### Deployment
- Manual: `npx wrangler deploy`
- No CI pipeline is currently configured.
