#!/bin/bash
# Sovereign.os — Worker Secrets Setup
# Run this once to configure all required secrets on the sovereign-os-api worker.
# Requires: wrangler CLI authenticated with your Cloudflare account.
#
# Usage: bash scripts/setup-secrets.sh
#
# Set these environment variables before running, or paste values when prompted:
#   STRIPE_SECRET_KEY
#   STRIPE_WEBHOOK_SECRET
#   STRIPE_PRICE_ID
#   RESEND_API_KEY
#   TURNSTILE_SECRET_KEY
#   COOKIE_DOMAIN

set -e

WORKER="sovereign-os-api"

echo "Setting secrets for $WORKER..."
echo "(You will be prompted for each value if not set as env vars)"
echo ""

# Stripe secret key (sk_live_...)
if [ -n "$STRIPE_SECRET_KEY" ]; then
  echo "$STRIPE_SECRET_KEY" | npx wrangler secret put STRIPE_SECRET_KEY --name "$WORKER"
else
  npx wrangler secret put STRIPE_SECRET_KEY --name "$WORKER"
fi

# Stripe webhook signing secret (whsec_...)
if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
  echo "$STRIPE_WEBHOOK_SECRET" | npx wrangler secret put STRIPE_WEBHOOK_SECRET --name "$WORKER"
else
  npx wrangler secret put STRIPE_WEBHOOK_SECRET --name "$WORKER"
fi

# Stripe price ID for Pro plan (price_...)
if [ -n "$STRIPE_PRICE_ID" ]; then
  echo "$STRIPE_PRICE_ID" | npx wrangler secret put STRIPE_PRICE_ID --name "$WORKER"
else
  npx wrangler secret put STRIPE_PRICE_ID --name "$WORKER"
fi

# Resend API key (re_...)
if [ -n "$RESEND_API_KEY" ]; then
  echo "$RESEND_API_KEY" | npx wrangler secret put RESEND_API_KEY --name "$WORKER"
else
  npx wrangler secret put RESEND_API_KEY --name "$WORKER"
fi

# Cloudflare Turnstile secret key
if [ -n "$TURNSTILE_SECRET_KEY" ]; then
  echo "$TURNSTILE_SECRET_KEY" | npx wrangler secret put TURNSTILE_SECRET_KEY --name "$WORKER"
else
  npx wrangler secret put TURNSTILE_SECRET_KEY --name "$WORKER"
fi

# Cookie domain
DOMAIN="${COOKIE_DOMAIN:-.defrag.app}"
echo "$DOMAIN" | npx wrangler secret put COOKIE_DOMAIN --name "$WORKER"

echo ""
echo "All secrets set for $WORKER."