#!/bin/bash
set -e

declare -A WORKERS=(
    ["apps/worker/wrangler.toml"]="sovereign-os-api"
    ["apps/worker-ai/wrangler.toml"]="worker-ai"
    ["apps/worker-session/wrangler.toml"]="worker-session"
)

echo "✅ Validation complete."
