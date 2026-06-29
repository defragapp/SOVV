#!/bin/bash
set -euo pipefail
echo "Executing strict deployment for SOVV Web..."
if [ "${CI:-false}" != "true" ]; then
  read -p "You are deploying WEB to PRODUCTION. Are you sure? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment aborted."
    exit 1
  fi
fi
npx wrangler deploy --env production --name sovv-web-production
