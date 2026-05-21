# SOVV

A Cloudflare Workers + Pages proof-of-concept for a privacy-first self-explanation assistant.

## What it includes

- Cloudflare Worker backend with Workers AI binding
- Free / Pro plan state in KV and Stripe checkout integration
- Notebook-style workspace UI on Next.js App Router
- Hidden baseline context storage for DOB / TOB / POB
- Strict JSON output enforcement for `/api/explain`
- Session persistence via secure worker cookies

## Development

1. Start the worker locally without browser OAuth:

   ```bash
   cd apps/worker
   WRANGLER_SKIP_BROWSER=1 npx wrangler dev --port 8787
   ```

2. Start the web frontend:

   ```bash
   cd apps/web
   npm run dev
   ```

3. Open the UI at `http://localhost:3000`.

## Baseline settings

Navigate to `/settings` to enter your hidden baseline context. The worker stores DOB, TOB, and POB in KV, and the backend uses it as internal prompt context without exposing it in the answer.

## Notes

- `apps/web/app/api/*` proxies requests to the worker backend and preserves session cookies.
- Baseline is required before the first `/api/explain` call.
- The worker will return a `needs_baseline` response if the hidden context has not yet been saved.
