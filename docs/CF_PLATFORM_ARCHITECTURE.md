# Sovereign.os Platform Architecture

## Core Principles

1. **One shared spine**: The platform is built as a single unified system, not multiple disconnected apps.
2. **Baseline Design in KV only**: The user's core configuration lives in Cloudflare KV for fast, server-side prompt injection. It is never exposed raw to the client.
3. **D1 as system of record**: Relational data (users, sessions, history, billing, library) lives in D1.
4. **R2 only for large assets**: Generated media, exports, and templates live in R2.
5. **Durable Objects only for active state**: DOs manage live, multi-step session flows (e.g., ConflictSessionDO), not permanent records.
6. **Queues for heavy work**: Background tasks like pattern extraction run asynchronously via Queues.
7. **Workers AI for the fast path**: Standard outputs use low-cost Workers AI models.
8. **AI Gateway in front of all AI calls**: Ensures observability, caching, and rate limiting.
9. **Stripe truth only on the server**: Billing validation happens strictly via D1 and webhook handlers in the API worker.
10. **Three spaces, one product**: Defrag, Alignment, and Covenant are different contextual lenses over the same underlying Baseline Design.

## Cloudflare Resources

- **Workers**:
  - `web` (Next.js frontend via OpenNext)
  - `worker` (Core API and orchestration)
  - `worker-ai` (Dedicated AI inference and prompt assembly)
  - `worker-session` (Durable Object host for interactive sessions)
- **Storage**:
  - `DB` (D1): vibesdk-db (Users, History, Subscriptions)
  - `KV` (KV): SOVV_DATA (Baseline Design, ephemeral limits)
  - `TEMPLATES` (R2): vibesdk-templates (Assets)
  - `CONFLICT_SESSION` (DO): ConflictSessionDO (Active flows)
- **Async**:
  - `PATTERN_QUEUE` (Queue): pattern-extraction-tasks
- **AI**:
  - `AI` (Workers AI binding)
  - `AI_SERVICE` (Service binding to worker-ai)

## Request Flow

1. User interacts with frontend (`app.defrag.app`).
2. Request hits API worker (`api.defrag.app`).
3. API worker looks up user in D1 and loads Baseline Design from KV.
4. API worker determines required space (Defrag, Alignment, Covenant).
5. If interactive flow, API worker delegates to Session worker (DO).
6. API/Session worker calls AI worker via service binding.
7. AI worker constructs prompt using Baseline Design and sends via AI Gateway.
8. AI worker returns structured JSON to API.
9. API stores history in D1 (if needed) and returns result to user.
