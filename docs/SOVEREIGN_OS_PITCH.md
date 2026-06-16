# Sovereign.os — Deploy Architecture (LOCKED)

## Web App (sovv-web) — CF Workers Builds
Build command: npm install
Deploy command: npm run deploy
Root directory: apps/web

Deploy script: next build && npx @opennextjs/cloudflare build && OPEN_NEXT_DEPLOY=false npx wrangler deploy --env production

RULES (do not change):
1. OPEN_NEXT_DEPLOY=false — prevents wrangler 4.100.0 from auto-detecting open-next
2. open-next.config.ts must NOT exist
3. wrangler.json must have build.command
4. production env must have no routes

## User Flow
1. Register → Turnstile → welcome email (Resend)
2. Set Baseline Design (DOB/TOB/POB) — all users
3. Free → Defrag (5/day backend limit)
4. Pro → All spaces (Defrag + Covenant + Alignment)
5. Upgrade → Stripe → webhook → tier=pro

## Hero (locked): Healing isn't optional. Holding the pain is.
