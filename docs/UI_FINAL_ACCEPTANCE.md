# UI Final Acceptance

## Deployment Verification
- [x] Standard `npm run build` succeeds.
- [x] Cloudflare OpenNext worker builds successfully (`npx @opennextjs/cloudflare build`).
- [x] `worker.js` and CSS payload generated safely in `.open-next/assets/`.
- [x] Wrangler dry run deploy succeeds, resolving all binding constraints.

## Pricing Truth Source
- The `$12/month` VS `$20/month` pricing mismatch has been resolved via a unified `marketing.ts` config.
- The `UpgradeBanner` and the Pricing page draw from the single true source (`PRICING_CONFIG`).
- Pro entitlements enforce the `$12` monthly text string uniformly. 

### Global Copy
- [x] Replaced "Bring the moment here" with sharper alternatives ("Start with what is happening now").
- [x] Replaced vague Covenant definitions with specific faith-context reflection copy.
- [x] Ensured the required hero ("Healing isn't optional. Holding the pain is.") is present on the primary landing page.
- [x] Verified that no "AI SaaS" vocabulary ("unlock insights", "empower your relationships") remains in public surfaces.
- [x] Re-authored the Landing Page to explicitly enforce the "Top-Tier Product Execution" requirements, relying entirely on structured bento layouts and deep gradients rather than noisy text walls.

### iOS / Mobile Experience
- [x] Verified all inputs enforce `font-size: 16px` to block iOS zoom.
- [x] Confirmed global layouts utilize `safe-top` and `safe-bottom` CSS classes mapping to `env(safe-area-inset-*)`.
- [x] Fixed `Shell.tsx` horizontal overflows switching to native Segmented Controls on iOS instead of CSS Grid columns.
- [x] Generated `manifest.json` for proper PWA / home-screen installation.

### Design System & Layouts
- [x] Verified `globals.css` properly cascades `--bg-primary` over generic Tailwind `bg-background` mappings to prevent tearing.
- [x] Checked button variants (`btn-primary`, `btn-secondary`) function properly and utilize standard cubic bezier (`0.16, 1, 0.3, 1`) transition animations.
- [x] Refactored `LoginScreen.tsx` to match the exact same `bg-background` and `text-foreground` utility overrides preventing clipping edges.
- [x] Upgraded SVG assets tracking to precision scanline grids and radial glows.

### Infrastructure & Deployments
- [x] OpenNext Cloudflare bindings map accurately across static `/_next/` paths.
- [x] Turnstile Verification keys dynamically load and fallback locally without generating unhandled execution blocks on login states.
- [x] Pushed and committed the current working state to `main` via the provided GitHub Pat token.

