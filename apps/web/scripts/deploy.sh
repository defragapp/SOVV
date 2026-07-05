#!/bin/bash
set -euo pipefail

echo "Executing strict OpenNext deployment for SOVV Web..."

echo "Target Worker: sovv-web-production"
echo "Expected production domains: defrag.app, www.defrag.app, app.defrag.app, sovereign.defrag.app"
echo "API domain must remain on the separate sovereign-os-api Worker: api.defrag.app"

if [ "${CI:-false}" != "true" ]; then
  read -p "You are deploying WEB to PRODUCTION. Are you sure? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment aborted."
    exit 1
  fi
fi

pnpm exec opennextjs-cloudflare build
pnpm exec opennextjs-cloudflare deploy
