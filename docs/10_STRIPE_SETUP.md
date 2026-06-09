# Stripe Billing Integration Setup

## Overview

Sovereign.os uses Stripe for subscription billing. All Stripe interactions happen server-side via the `sovereign-os-api` Cloudflare Worker at `apps/worker/src/billing.ts`. The frontend only reads the `subscription_status` flag from API responses.

## Webhook Configuration

**Endpoint URL:** `https://api.defrag.app/api/billing/webhook`

### Required Event Types

Subscribe to these events in the Stripe Dashboard → Developers → Webhooks:

| Event Type | Purpose |
|---|---|
| `checkout.session.completed` | First-time payment success — sets tier=pro, subscription_status=active |
| `invoice.payment_succeeded` | Recurring payment success — refreshes subscription_status, period end |
| `invoice.payment_failed` | Payment failure — sets subscription_status=past_due |
| `customer.subscription.deleted` | Cancellation — sets tier=free, subscription_status=canceled |
| `customer.subscription.updated` | Status changes — syncs subscription_status dynamically |

### Webhook Signing Secret

1. In Stripe Dashboard, create the webhook endpoint above
2. Reveal the signing secret (whsec_...)
3. Set as Worker secret: `npx wrangler secret put STRIPE_WEBHOOK_SECRET`

## Worker Secrets Required

Set these via `npx wrangler secret put <NAME>` for the `sovereign-os-api` worker:

| Secret | Description | Source |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe API secret key (sk_live_...) | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (whsec_...) | Stripe Dashboard → Developers → Webhooks |
| `STRIPE_PRICE_ID` | Price ID for the Pro subscription (price_...) | Stripe Dashboard → Products → Pro → Pricing |
| `APP_URL` | Application URL: `https://app.defrag.app` | Static value |

## Price Configuration

The worker creates checkout sessions using `env.STRIPE_PRICE_ID` with quantity=1, mode=subscription.
The `success_url` redirects to `${env.APP_URL}/app?upgraded=1` and `cancel_url` to `${env.APP_URL}/app?canceled=1`.

### Stripe Dashboard Product Setup

1. Create a Product named "Pro" in Stripe Dashboard
2. Create a recurring price (e.g., $20/month)
3. Copy the Price ID (`price_xxx`) to the `STRIPE_PRICE_ID` secret

## D1 Migration

The `subscription_status` column requires migration `002_subscription_status.sql`:

```sql
ALTER TABLE users ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN stripe_price_id TEXT;
ALTER TABLE users ADD COLUMN subscription_current_period_end INTEGER;
ALTER TABLE users ADD COLUMN subscription_updated_at INTEGER;
```

Run: `wrangler d1 execute vibesdk-db --remote --file=apps/worker/migrations/002_subscription_status.sql`

## Subscription Status States

| Status | Meaning | Tier |
|---|---|---|
| `free` | No subscription — default for new users | free |
| `active` | Subscription active and in good standing | pro |
| `past_due` | Payment failed — grace period | pro (degraded) |
| `canceled` | Subscription ended | free |
| `incomplete` | First payment pending | free |

## Gate Behavior

- **402 Payment Required** returned for workspace routes (`/api/explain`, `/api/baseline`, `/api/patterns`, `/api/history`, `/api/chips`) when `subscription_status` is not `active`
- Frontend Defrag/Covenant pages check `/api/auth/tier` and show `UpgradeBanner` if not active
- The `/api/auth/subscription` endpoint provides detailed status for frontend gate logic