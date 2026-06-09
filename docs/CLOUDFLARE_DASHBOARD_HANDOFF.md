# Cloudflare Dashboard Handoff

## CRITICAL: Workers Builds Not Configured

The Sovereign.os frontend (`sovv-web`) is not currently configured to use Cloudflare Workers Builds. All previous deployments (including the old UI state) were pushed manually via `wrangler deploy`. Because of this, pushing to `main` on GitHub **will not** automatically trigger a live deployment.

To deploy the new premium UI system (Commit `d61ecad193e9656c419e053905e931cb91bfaea4`), you must manually connect the repository to the Cloudflare dashboard.

### Required Actions (In Cloudflare Dashboard)

1. Navigate to: **Workers & Pages -> sovv-web -> Settings -> Builds**
2. Click **Connect to GitHub** and authorize the `defragapp/SOVV` repository.
3. Configure the Build Settings exactly as follows:
   - **Branch:** `main`
   - **Root directory:** `apps/web`
   - **Build command:** `npm install`
   - **Deploy command:** `npm run deploy`
   - **Node version:** `22` (Select 22 via dashboard dropdown)
4. Click **Save and Deploy**.

Cloudflare will immediately pull the latest `main` commit (`d61ecad...`), run `@opennextjs/cloudflare build`, and deploy the `.open-next/worker.js` bundle to edge. 

### Verification
Once the dashboard states the deployment was successful, verify the following URLs:
- `https://defrag.app` (Should no longer display `container-platform` or `bg-hero-glow` classes, and utilize the clean premium bento-grid layout).
- `https://app.defrag.app` (Should utilize the new Mobile Segmented tabs layout).
