#!/bin/bash
set -euo pipefail

TARGET_WORKER="sovv-web"
CONFIG_FILE="wrangler.json"
ENVIRONMENT="production"

echo "Preparing strict deployment for ${TARGET_WORKER}..."

if [ "${CI:-false}" != "true" ]; then
  read -p "You are deploying WEB to PRODUCTION target ${TARGET_WORKER}. Continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment aborted."
    exit 1
  fi
fi

pnpm exec wrangler deploy --env "${ENVIRONMENT}" --config "${CONFIG_FILE}"
