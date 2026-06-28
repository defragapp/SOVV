# SOVV Setup Guide — Per-Application Configuration

## 📋 Table of Contents

1. [Root Monorepo Setup](#root-monorepo-setup)
2. [Worker (API Server)](#worker-api-server)
3. [Web Frontend](#web-frontend)
4. [Worker-Session Service](#worker-session-service)
5. [Worker-AI Service](#worker-ai-service)
6. [Packages (Core)](#packages-core)

---

## Root Monorepo Setup

### Prerequisites

- **Node.js 22** (see `.nvmrc`)
- **pnpm 9+** for monorepo management
- **Cloudflare account** with API token (for deployment)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/defragapp/SOVV.git
cd SOVV

# Install all dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Add Cloudflare credentials (required for deployment)
echo "CLOUDFLARE_API_TOKEN=<your-token>" >> .env.local
```

### Verify Monorepo Health

```bash
# Type-check all packages
pnpm typecheck

# Run all tests
pnpm test

# Build all apps
pnpm build

# Start development server (all apps)
pnpm dev
```

---

## Worker (API Server)

**Purpose:** Cloudflare Worker handling LLM inference, memory management, and billing  
**Path:** `apps/worker`  
**Deployment:** `sovereign-os-api` on Cloudflare

### Environment Setup

```bash
cd apps/worker

# Required environment variables (add to .env.local at root)
CLOUDFLARE_ACCOUNT_ID=<your-account-id>
CLOUDFLARE_API_TOKEN=<your-api-token>

# Worker-specific bindings (configured in wrangler.toml)
# DB: D1 database "vibesdk-db"
# KV: Key-Value store "SOVV_DATA"
# TEMPLATES: R2 bucket "vibesdk-templates"
```

### Local Development

```bash
# Install dependencies
pnpm install

# Start in watch mode (with Wrangler)
pnpm dev

# Type-check
npx tsc --noEmit

# Run tests
pnpm test
```

### Testing

```bash
# Run all worker tests
npx vitest run --reporter=verbose

# Run specific test file
npx vitest run src/__tests__/safety.test.ts

# Watch mode (re-run on changes)
npx vitest watch
```

### Deployment

```bash
# Deploy to Cloudflare
npx wrangler deploy

# With specific environment
npx wrangler deploy --env production

# Check deployment status
npx wrangler whoami
```

### Database Migrations

```bash
# Create migration
npx wrangler d1 migrations create <database> <migration-name>

# Apply migrations
npx wrangler d1 migrations apply vibesdk-db

# Query database
npx wrangler d1 execute vibesdk-db --local --command "SELECT * FROM users LIMIT 10;"
```

### KV Namespace Access

```bash
# List all keys in KV
npx wrangler kv:key list --namespace-id 3bd3ff5048a8468e82c574d7d66045c3

# Get a key
npx wrangler kv:key get "cache_key" --namespace-id 3bd3ff5048a8468e82c574d7d66045c3

# Delete a key
npx wrangler kv:key delete "cache_key" --namespace-id 3bd3ff5048a8468e82c574d7d66045c3
```

---

## Web Frontend

**Purpose:** Next.js application providing UI for workspace, studio, and marketplace  
**Path:** `apps/web`  
**Deployment:** `sovv-web` on Cloudflare Pages + OpenNext

### Environment Setup

```bash
cd apps/web

# Required environment variables (add to .env.local at root)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAADhGIF8-iOLIg8MU

# For OpenNext builds (Cloudflare deployment)
CLOUDFLARE_API_TOKEN=<your-token>
CLOUDFLARE_ACCOUNT_ID=<your-account-id>
```

### Local Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Open http://localhost:3000
```

### Building for Production

```bash
# Build Next.js
npm run build

# Build OpenNext (Cloudflare adapter)
npx @opennextjs/cloudflare build

# Preview locally
npx @opennextjs/cloudflare preview
```

### Deployment

```bash
# Deploy via wrangler
npx wrangler deploy

# Or use automated deploy script
bash scripts/deploy.sh
```

### Generate Cloudflare Types

```bash
# Create TypeScript definitions for Cloudflare env
npm run cf-typegen

# Output: cloudflare-env.d.ts
```

---

## Worker-Session Service

**Purpose:** Manages user session state across workers  
**Path:** `apps/worker-session`  
**Deployment:** `worker-session` on Cloudflare

### Environment Setup

```bash
cd apps/worker-session

# Required environment variables
CLOUDFLARE_ACCOUNT_ID=<your-account-id>
CLOUDFLARE_API_TOKEN=<your-token>
```

### Local Development

```bash
pnpm install
pnpm dev
```

### Deployment

```bash
npx wrangler deploy --env production
```

---

## Worker-AI Service

**Purpose:** Handles AI/LLM inference workloads  
**Path:** `apps/worker-ai`  
**Deployment:** `worker-ai` on Cloudflare

### Environment Setup

```bash
cd apps/worker-ai

# Required for LLM inference
# ANTHROPIC_API_KEY or OPENAI_API_KEY (depending on provider)
```

### Local Development

```bash
pnpm install
pnpm dev
```

### Deployment

```bash
npx wrangler deploy --env production
```

---

## Packages (Core)

**Purpose:** Shared React components and utilities  
**Path:** `packages/core`

### Structure

```
packages/core/
├── src/
│   ├── index.ts              # Main export
│   ├── components/           # React components (MemoryPanel, PatternCard, etc)
│   ├── hooks/                # React hooks
│   ├── utils/                # Utilities (formatting, validation)
│   └── types/                # Shared TypeScript types
├── package.json              # Exports as @sovereign/core
└── tsconfig.json             # TypeScript config
```

### Usage in Other Apps

```json
{
  "dependencies": {
    "@sovereign/core": "file:../../packages/core"
  }
}
```

### Building & Testing

```bash
cd packages/core

# No build step needed (used directly during dev)
# During production builds, Next.js/Wrangler will transpile

# Run tests (if any)
pnpm test
```

---

## 🔧 Common Tasks

### Monorepo-Wide Operations

```bash
# Run command in specific workspace
pnpm -F @app/worker test
pnpm -F @app/web build

# Run tests across all apps
pnpm test

# Type-check everything
pnpm typecheck

# Clean all build artifacts
pnpm clean
```

### Development Server Management

```bash
# Start all apps in watch mode
pnpm dev

# Start only specific app
pnpm -F @app/web dev

# Kill all dev servers
pkill -f "next dev|wrangler dev"
```

### Dependency Management

```bash
# Add package to specific workspace
pnpm add -w -D typescript @types/node  # Root
pnpm add lodash -F @app/worker         # Worker app
pnpm add react-query -F @app/web       # Web app

# Update all dependencies
pnpm update

# Check for vulnerabilities
pnpm audit
```

---

## 🐛 Troubleshooting

### Build Failures

```bash
# Clear all caches
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild from scratch
pnpm clean && pnpm install && pnpm build
```

### TypeScript Errors

```bash
# Check all TypeScript errors
pnpm typecheck

# Fix errors in specific app
cd apps/worker
npx tsc --noEmit
```

### Worker Deployment Issues

```bash
# Verify Cloudflare credentials
npx wrangler whoami

# Check account ID
echo $CLOUDFLARE_ACCOUNT_ID

# Deploy with verbose logging
npx wrangler deploy --verbose
```

### Local Dev Server Issues

```bash
# Check if ports are in use
lsof -i :3000  # Next.js
lsof -i :8787  # Wrangler

# Kill process on port
kill -9 <PID>
```

---

## 📞 Getting Help

- **Type errors:** Run `pnpm typecheck` — all TS errors are blocking
- **Test failures:** Run `pnpm test` — all tests must pass before deployment
- **Deployment issues:** Check `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
- **Build issues:** Clear cache with `pnpm store prune` and `pnpm install`
