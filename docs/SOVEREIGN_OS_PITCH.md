# Sovereign.os — Investor Pitch & Marketing Copy

## Hero Copy (locked)
> Healing isn't optional. Holding the pain is.

## Tagline
> The conversation ended. Your body did not. The pattern is still active.

## Space Copy
- **Defrag**: See what you couldn't see from inside the moment.
- **Covenant**: Faith, reflection, and grounded discernment for what you are walking through.
- **Alignment**: Turn insight into a usable response. See what is yours to carry.
- **Library**: The private record of what helped. Return before the old pattern takes over again.
- **Baseline Design**: The starting map. How you tend to process, respond, connect, protect, communicate, and return to center.

## Deploy Architecture (LOCKED — do not change without updating this doc)

### Web App (sovv-web)
Deployed by: **Cloudflare Workers Builds dashboard** (auto-triggers on push to main)

Build settings:
- Build command: `npm install`
- Deploy command: `npm run deploy`
- Root directory: `apps/web`

Deploy script (apps/web/package.json):
```
next build && pnpm exec opennextjs-cloudflare build && pnpm exec wrangler deploy --env production
```

**CRITICAL**: wrangler.json must NOT have a build.command. Adding it causes a double-build and 500 errors.

### API Worker (sovereign-os-api)
Deployed by: GitHub Actions (deploy-api job)
