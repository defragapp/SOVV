#!/bin/bash
set -euo pipefail

echo "=== Sovereign Platform Setup ==="

# 1. Ensure pnpm is available through Corepack.
corepack enable
corepack prepare pnpm@9.15.9 --activate

# 2. Install monorepo dependencies from the canonical lockfile.
pnpm install --frozen-lockfile

# Secure token handling — never log, never commit.
if [ -n "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "✅ Cloudflare API Token configured"
else
  echo "⚠️  CLOUDFLARE_API_TOKEN not set. Set it via GitHub Secrets or export before authorized Cloudflare work."
fi

# 3. Create local environment stubs.
# IMPORTANT: These files are local only. Do not commit .dev.vars to Git.
for app in worker worker-ai worker-session; do
  vars_file="apps/$app/.dev.vars"
  cat > "$vars_file" << EOF_VARS
CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN:-}
CLOUDFLARE_ACCOUNT_ID=8b1954d216d65077c6480d62583fe2c2
APP_URL=http://localhost:3000
EOF_VARS
done

# 4. Create web env stub if missing.
if [ ! -f "apps/web/.env.local" ]; then
  cat > "apps/web/.env.local" << 'EOF_ENV'
NEXT_PUBLIC_API_BASE=http://localhost:8787
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
EOF_ENV
fi

# 5. Verify wrangler configs that are expected to exist.
echo "=== Validating wrangler config files ==="
for config in apps/worker/wrangler.toml apps/worker-ai/wrangler.toml apps/worker-session/wrangler.toml; do
  if [ -f "$config" ]; then
    name=$(grep '^name = ' "$config" | head -1 | cut -d'"' -f2 || true)
    echo "✅ $config → ${name:-unknown}"
  else
    echo "⚠️  Missing $config"
  fi
done

if [ -f "apps/web/wrangler.json" ]; then
  web_name=$(grep '"name"' apps/web/wrangler.json | head -1 | cut -d'"' -f4)
  echo "✅ apps/web/wrangler.json → $web_name"
fi

# 6. Validate repository health.
echo "=== Running repository verification ==="
pnpm run verify

echo "=== Setup Complete ==="
