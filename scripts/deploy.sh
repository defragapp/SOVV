#!/bin/bash
set -e

echo "🚀 Sovereign Platform Production Deployment"

if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Uncommitted changes detected."
    git status --short
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then exit 1; fi
fi

echo "📤 Deploying worker-ai..."
cd apps/worker-ai && npx wrangler deploy && cd ../..

echo "📤 Deploying worker-session..."
cd apps/worker-session && npx wrangler deploy && cd ../..

echo "📤 Deploying sovereign-os-api..."
cd apps/worker && npx wrangler deploy && cd ../..

echo "📤 Deploying sovv-web..."
cd apps/web && npx opennextjs-cloudflare build && npx wrangler deploy && cd ../..

echo ""
echo "✅ Deployed. Verify with:"
echo "  npx wrangler deployment list --name sovv-web"
echo "  npx wrangler deployment list --name sovereign-os-api"
echo "  npx wrangler deployment list --name worker-ai"
echo "  npx wrangler deployment list --name worker-session"
