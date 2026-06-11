#!/bin/bash
set -e

echo "🚀 Sovereign Platform Setup"
npm install

# Setup Web Environment Variables
if [ ! -f "apps/web/.env.local" ] && [ -f "apps/web/.env.example" ]; then
  echo "Setting up web environment variables..."
  cp apps/web/.env.example apps/web/.env.local
fi

# Setup Worker Environment Variables
WORKERS=("worker" "worker-ai" "worker-session")
for worker in "${WORKERS[@]}"; do
  if [ ! -f "apps/$worker/.dev.vars" ] && [ -f "apps/$worker/.dev.vars.example" ]; then
    echo "Setting up .dev.vars for $worker..."
    cp apps/$worker/.dev.vars.example apps/$worker/.dev.vars
  fi
done
