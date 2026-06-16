# Sovereign.os — Deploy Architecture (LOCKED)

## Web App (sovv-web) — CF Workers Builds
Build command: npm install
Deploy command: npm run deploy
Root directory: apps/web

Deploy script: next build && npx @opennextjs/cloudflare build && npx wrangler deploy --env production

RULES (do not change):
1. open-next.config.ts must NOT exist — wrangler 4.100.0 auto-detects it
2. wrangler.json must have build.command
3. production env must have no routes

## User Flow
1. Register → Turnstile verification → welcome email (Resend)
2. Set Baseline Design (DOB/TOB/POB) — required for all users
3. Free tier → Defrag space (5 sessions/day, backend enforced)
4. Pro tier → All spaces (Defrag + Covenant + Alignment)
5. Upgrade → Stripe checkout → webhook → tier=pro

## Hero Copy (locked)
Healing isn't optional. Holding the pain is.

## Tagline
The conversation ended. Your body did not. The pattern is still active.
