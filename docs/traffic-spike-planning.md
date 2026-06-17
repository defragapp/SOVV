# Traffic Spike Planning — Sovereign.os

## Architecture (already handles spikes automatically)

Sovereign.os runs entirely on Cloudflare's edge:
- **Workers** — auto-scale to millions of requests, no cold starts
- **D1** — SQLite at the edge, handles concurrent reads well
- **KV** — globally distributed, sub-millisecond reads
- **R2** — object storage, no egress fees, scales automatically
- **Workers AI** — rate-limited per account, not per user

## Current limits (Free/Paid Cloudflare plan)

| Resource | Limit | Action at spike |
|---|---|---|
| Workers requests | 100k/day free, unlimited paid | Upgrade to Workers Paid ($5/mo) |
| D1 reads | 5M/day free | Monitor, upgrade if needed |
| D1 writes | 100k/day free | Monitor, upgrade if needed |
| KV reads | 100k/day free | Monitor, upgrade if needed |
| Workers AI | ~10k requests/day | Add AI Gateway for caching |
| Rate limiter | 15 req/min per IP (configured) | Already in place |

## Recommended actions before launch / spike

### 1. Upgrade Cloudflare plan
- Workers Paid: $5/mo — removes 100k/day request limit
- D1 Paid: included in Workers Paid — 25B reads/mo

### 2. Enable AI Gateway caching
- Cache identical AI requests (same baseline + same input) for 1 hour
- Reduces AI costs by ~40-60% for common patterns
- Add to wrangler.toml: `gateway = { id = "sovereign-ai-gateway", cache_ttl = 3600 }`

### 3. Add Cloudflare Cache Rules for static assets
- Cache `/product/*`, `/pricing`, `/about` etc at edge for 1 hour
- Already handled by OpenNext + Workers Assets

### 4. Database connection pooling
- D1 handles this automatically — no action needed

### 5. Monitor with Cloudflare Analytics
- Workers Analytics: dash.cloudflare.com → Workers → Analytics
- Set up alerts for error rate > 1% or p99 latency > 2s

### 6. Rate limiting (already configured)
- 15 requests/minute per IP via RATE_LIMITER binding
- Increase to 30/min for Pro users if needed

### 7. Baseline Design caching
- Already cached in KV with `baseline:{user_id}` key
- derive-profile results could be cached for 24h (same baseline = same output)

## Cost estimate at scale

| Users/day | Workers requests | AI calls | Est. cost/mo |
|---|---|---|---|
| 100 | ~2k | ~500 | $0 (free tier) |
| 1,000 | ~20k | ~5k | ~$5 (Workers Paid) |
| 10,000 | ~200k | ~50k | ~$15-25 |
| 100,000 | ~2M | ~500k | ~$50-100 |

Cloudflare Workers is one of the most cost-efficient platforms for this workload.
The main cost driver at scale is Workers AI inference — consider adding a caching layer.
