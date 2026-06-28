# SOVV: Open Source Visual Vocabulary

A distributed, multi-app platform for collaborative intelligence built on Cloudflare Workers, Next.js, and a modular package architecture.

## 🏗️ Architecture Overview

```
SOVV (monorepo)
├── apps/
│   ├── worker              # Cloudflare Workers API (sovereign-os-api)
│   ├── web                 # Next.js frontend + studio
│   └── [other microservices]
├── packages/
│   ├── core/               # Shared React components & utilities
│   ├── db/                 # Database models & migrations
│   ├── config/             # Shared configuration
│   └── [domain packages]
├── scripts/                # Utility scripts for deployment & maintenance
└── docs/                   # Architecture & runbooks
```

### Key Applications

- **API Worker** (`apps/worker`): Cloudflare Worker handling LLM inference, memory management, and billing
- **Web App** (`apps/web`): Next.js application providing UI for workspace, studio, and marketplace
- **Shared Packages** (`packages/`): Reusable components, utilities, and domain logic

## 🚀 Getting Started

### Prerequisites

- **Node.js 22** (see `.nvmrc`)
- **npm 10+** for workspace management
- **Cloudflare account** for worker deployment (optional for local dev)

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/defragapp/SOVV.git
   cd SOVV
   npm ci
   ```

2. **Configure environment**
   ```bash
   # Copy template and fill in secrets
   cp .env.example .env.local
   
   # Add Cloudflare credentials for worker deployment (if needed)
   echo "CLOUDFLARE_API_TOKEN=<your-token>" >> .env.local
   ```

3. **Run locally**
   ```bash
   # Start all apps in watch mode (requires turbo)
   npm run dev
   
   # Or run individual apps
   npm run -w apps/web dev
   npm run -w apps/worker dev
   ```

4. **Run tests**
   ```bash
   # All tests
   npm run verify
   
   # Specific workspace
   npm run -w apps/worker test
   ```

## 📦 Package Structure

### `packages/core`
Shared React components used across web frontend:
- Memory timeline, pattern cards, artifact display
- Exported from `packages/core/src/index.ts`

### `packages/db`
Database schema, migrations, and ORM utilities

### `packages/config`
Shared TypeScript configuration, environment variables, constants

## 🔧 Deployment

### Cloudflare Worker Deployment

```bash
cd apps/worker
npx wrangler deploy
```

**Requires:**
- `CLOUDFLARE_API_TOKEN` environment variable
- Valid `wrangler.toml` configuration

### GitHub Actions CI/CD

The `deploy.yml` workflow:
1. **TypeScript Check** - Validates type safety (blocking failures)
2. **Test Suite** - Runs worker unit tests (blocking failures)
3. **Deploy API** - Deploys to Cloudflare Workers on main branch push

**Important:** TypeScript errors and test failures **block deployment**.

## 🛡️ Build & Development Standards

### TypeScript Configuration

- **Strict mode enabled** across all packages
- Root `tsconfig.json` enforces strict type checking
- Type errors in CI/CD are **non-negotiable**

### Testing

- Worker logic: Vitest with unit test coverage
- Web frontend: [Test framework] (see `apps/web/package.json`)
- Run full suite before pushing: `npm run verify`

### Code Quality

- **Linting**: ESLint (enforced in CI)
- **Formatting**: Prettier (auto-applied)
- **Type Safety**: TypeScript strict mode

## 🔒 Safety & Security Hardening

All AI-facing endpoints are protected by a shared safety layer integrated at the request boundary. This includes:

### Request Validation
- **Content-Type enforcement**: Only `application/json` accepted
- **Body size limits**: Configurable per endpoint (50KB–100KB)
- **Schema validation**: Zod schemas for request structure and type safety

### Rate Limiting
- **Sliding window algorithm** with per-user/IP-based keying
- **Presets**: `loose`, `normal`, `strict`, `perSecond`
- **Configurable TTL**: KV-backed with 1-week retention for metrics

### Risk Detection & Logging
- **Crisis signal detection**: Keywords checked non-blocking against known risk patterns (suicide, self-harm language)
- **Safety events logged**: Validation errors, rate limit breaches, risk word detections, system errors
- **Request correlation**: UUID requestId included in all logs for audit trails
- **Event aggregation**: Daily KV storage with 7-day retention and metrics export

### Protected Endpoints
- `/api/alignment` — Alignment brief generation (entry/workspace modes)
- `/api/covenant` — Covenant biblical reframing
- `/api/audio` — Text-to-speech synthesis
- `/api/explain` — Behavioral pattern explanation (Defrag LLM)

### Verification
```bash
cd apps/worker
npm test -- tests/safety*.test.ts tests/*-request.test.ts tests/rate-limiter.test.ts tests/safety-logger.test.ts
```

All safety middleware is tested with comprehensive unit tests covering edge cases, concurrency, and failure modes.

## 📋 Important Files & Conventions

| File | Purpose |
|------|---------|
| `.gitignore` | Version control exclusions (clean, deduplicated) |
| `.env.example` | Template for required environment variables |
| `package-lock.json` | Locks npm workspace dependency resolution |
| `turbo.json` | Turbo build orchestration & caching |
| `.github/workflows/deploy.yml` | Automated deployment pipeline |

### .gitignore Guidelines

- ✅ Commit source code (even stale components tracked for cleanup)
- ✅ Commit configuration (wrangler.toml, package.json)
- ❌ Never commit `.env` files with real secrets
- ❌ Never commit `node_modules/` or build output
- ❌ Never commit sensitive scripts (API keys, tokens)

## 🚨 Troubleshooting

### Worker Deployment Fails

1. **Missing CLOUDFLARE_API_TOKEN**
   ```bash
   echo "Check: echo $CLOUDFLARE_API_TOKEN"
   ```

2. **wrangler.toml misconfiguration**
   ```bash
   cd apps/worker && npx wrangler whoami
   ```

3. **Type errors block deployment**
   ```bash
   # Check TypeScript errors before deploy
   npx tsc --noEmit
   ```

### Development Server Issues

```bash
# Verify npm cache
npm cache verify

# Reinstall dependencies
rm -rf node_modules
npm ci

# Start from scratch
rm -rf node_modules && npm ci && npm run dev
```

## 📚 Development Workflow

### Making Changes

1. **Create feature branch** from `main`
   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make changes across workspace**
   ```bash
   # Update packages/core or apps/worker, etc.
   ```

3. **Type check and test**
   ```bash
   npm run lint
   npm run -w apps/worker test
   ```

4. **Create pull request** with clear description
   - Reference related issues
   - Include test results in PR body

### Releasing

- Merges to `main` trigger GitHub Actions deployment
- Changes propagate to Cloudflare Workers and web frontend
- Verify deployment in PR checks

## 🔐 Security Considerations

- **API Safety Layer**: All AI-facing endpoints have request validation, rate limiting, and risk detection (see [Safety & Security Hardening](#-safety--security-hardening))
- **Environment Variables**: Use `.env.local` for secrets (never committed)
- **Billing Webhook**: Uses HMAC signature verification + idempotency checks for authenticity
- **API Tokens**: Rotate `CLOUDFLARE_API_TOKEN` quarterly
- **Dependencies**: Run `npm audit` before major releases
- **Audit Logging**: Safety events (validation errors, rate limits, risk words) logged with request IDs for traceability

## 📞 Support & Contributing

- **Issues**: Report bugs on GitHub with reproduction steps
- **Discussions**: Use GitHub Discussions for architecture questions
- **PRs**: All changes require type checks, tests, and CI approval

## 📄 License

[See LICENSE file]
