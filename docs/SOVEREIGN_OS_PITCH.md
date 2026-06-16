# Sovereign.os — Investor Pitch & Marketing Copy

## Hero Copy (locked)
> Healing isn't optional. Holding the pain is.

## Tagline  
> The conversation ended. Your body did not. The pattern is still active.

## Deploy Architecture (LOCKED)

### Web App (sovv-web)
Deployed by: Cloudflare Workers Builds dashboard

Build settings:
- Build command: npm install
- Deploy command: npm run deploy
- Root directory: apps/web

Deploy script (apps/web/package.json):
next build && pnpm exec opennextjs-cloudflare build && mv open-next.config.ts /tmp/onc.ts.bak && pnpm exec wrangler deploy --env production; mv /tmp/onc.ts.bak open-next.config.ts 2>/dev/null || true

CRITICAL: wrangler.json must NOT have build.command.
The deploy script renames open-next.config.ts before wrangler runs to
prevent wrangler from auto-detecting open-next and calling opennextjs-cloudflare deploy.
