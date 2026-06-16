# Sovereign.os — Deploy Architecture (LOCKED)

## Web App (sovv-web)
Deployed by: Cloudflare Workers Builds dashboard

Build settings (DO NOT CHANGE):
- Build command: npm install
- Deploy command: npm run deploy  
- Root directory: apps/web

Deploy script (apps/web/package.json):
next build && npx @opennextjs/cloudflare build && npx wrangler deploy --env production

CRITICAL RULES:
1. open-next.config.ts must NOT exist — wrangler 4.100.0 auto-detects it and fails
2. wrangler.json must have build.command (prevents a different auto-detection path)
3. production env must have no routes (skips zone API permission error)
4. Deploy script uses npx (not pnpm exec) to avoid supply-chain policy issues

## Hero Copy (locked)
Healing isn't optional. Holding the pain is.

## Tagline
The conversation ended. Your body did not. The pattern is still active.
