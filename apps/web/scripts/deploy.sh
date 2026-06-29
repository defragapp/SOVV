#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Installing web dependencies..."
npm install --legacy-peer-deps

echo "Building Next.js app..."
npm run build

echo "Building OpenNext Cloudflare bundle..."
npx @opennextjs/cloudflare build

echo "Deploying sovv-web to Cloudflare..."
npx wrangler deploy
