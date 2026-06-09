# Cloudflare Workers Deployments

The Sovereign.os API (`sovereign-os-api`) and frontend (`sovv-web`) utilize Cloudflare Workers and Pages infrastructure. Currently, deployments are executed **manually** via the Wrangler CLI.

## `sovereign-os-api` Bindings 

The API worker relies on specific binding strings mapped to explicit Cloudflare resource IDs. 

| Resource Type | Resource Name | Binding (Code) | ID |
| ------------- | ------------- | -------------- | -- |
| D1 Database | `vibesdk-db` | `DB` | `c8c2fd8d-5297-46fc-8594-7629c8bad74d` |
| KV Namespace| `SOVV_DATA` | `KV` | `3bd3ff5048a8468e82c574d7d66045c3` |
| R2 Bucket | `vibesdk-templates` | `R2` | n/a |

**CRITICAL NOTE:** The binding name for the database in code is `DB` (e.g. `env.DB`), not `vibesdk-db`. The `wrangler.toml` must enforce this explicitly. 

## Expected `wrangler.toml` for `sovereign-os-api`

```toml
name = "sovereign-os-api"
main = "src/index.ts"
compatibility_date = "2026-06-04"

[[d1_databases]]
binding = "DB"
database_name = "vibesdk-db"
database_id = "c8c2fd8d-5297-46fc-8594-7629c8bad74d"

[[kv_namespaces]]
binding = "KV"
id = "3bd3ff5048a8468e82c574d7d66045c3"

[[r2_buckets]]
binding = "R2"
bucket_name = "vibesdk-templates"

[vars]
FREE_DAILY_LIMIT = "15"
```

## Secrets
Do not place secrets in `wrangler.toml`. Manage the following using `npx wrangler secret put <NAME>`:
- `TURNSTILE_SECRET_KEY`
- `TEAM_DOMAIN`
- `POLICY_AUD`
