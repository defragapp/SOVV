#!/bin/bash

# Cloudflare setup
echo "Setting secret in Cloudflare for worker..."
(cd apps/worker && npx wrangler secret put RESEND_API_KEY)

# GitHub Setup
echo "Setting secret in GitHub Repository..."
gh secret set RESEND_API_KEY
