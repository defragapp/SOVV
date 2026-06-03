# SOVV

SOVV is a privacy-first self-explanation assistant built with Cloudflare Workers and Next.js.

## What it is

SOVV helps a user explore patterns, structure, and practice options in a private workspace. It is designed to show helpful summaries and framing, not diagnosis, guarantees, or internal engine detail.

## What you can expect

- A notebook-style workspace for reflective, structured input
- A worker-backed API that keeps sensitive context server-side
- Public-facing language that stays aligned with the approved product vocabulary
- A lightweight setup that works with the existing Cloudflare + Next.js development flow

## Quick start

To run the app locally:

1. Start the worker:

   ```bash
   cd apps/worker
   WRANGLER_SKIP_BROWSER=1 npx wrangler dev --port 8787
   ```

2. Start the web app:

   ```bash
   cd apps/web
   npm run dev
   ```

3. Open the UI at <http://localhost:3000>

## Notes for users and contributors

- The public product experience should stay simple, respectful, and non-diagnostic.
- Sensitive baseline context and internal reasoning remain server-side and are not exposed to the client.
- For day-to-day development, prefer the existing Cloudflare Worker and Next.js workflow already used in this repository.

## Deployment and release flow

Use the existing Cloudflare + GitHub workflow for releases:

- Run `npm run build` to validate the current OpenNext/Cloudflare build path.
- Use Node.js 22+ for the Cloudflare deploy path (the workflow uses Node 24).
- Run `npm run deploy -w apps/worker` to deploy the Worker API.
- Run `npm run deploy -w apps/web` to deploy the Next.js/Cloudflare app.
- Use `npm run ship -- "short summary"` to switch to `main`, pull latest changes, commit staged work, and push to GitHub.

The helper script lives in `scripts/push-live.sh`, and the live deploy path is triggered by the workflow in `.github/workflows/deploy-live.yml` on pushes to `main`.

For the GitHub Actions deploy path, the repository needs the `CLOUDFLARE_API_TOKEN` secret configured in GitHub.
