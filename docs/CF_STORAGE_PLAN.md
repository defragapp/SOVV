# Sovereign.os Storage Plan

## Storage Layers

### 1. Cloudflare KV (`SOVV_DATA`)
**Purpose**: High-speed, edge-cached configuration and transient data.
**Data Stored**:
- `baseline:{user_id}`: The user's active Baseline Design payload.
- `usage:{user_id}:{date}`: Daily usage counters for free tier limits.
- Cache entries for frequently accessed but rarely changed data.

### 2. Cloudflare D1 (`vibesdk-db`)
**Purpose**: The authoritative system of record.
**Data Stored**:
- `users`: Core account details and Stripe customer IDs.
- `subscriptions`: Stripe plan status, period ends, and tier entitlement.
- `history` / `library`: Saved results from Defrag, Alignment, and Covenant spaces.
- `workspaces`: Optional team/group organization.

### 3. Cloudflare Durable Objects (`ConflictSessionDO`)
**Purpose**: Coordinating multi-step or multi-user interactive state.
**Data Stored**:
- In-progress dialogue states.
- Temporary context for "Compare with Someone" flows.
**Note**: State in DOs should be considered ephemeral; final artifacts must be saved to D1.

### 4. Cloudflare R2 (`vibesdk-templates`)
**Purpose**: Blob storage for large artifacts.
**Data Stored**:
- Generated PDFs or long-form narrative exports.
- Pre-rendered Watch Previews or audio summaries.
- Static application assets or templates.

### 5. Cloudflare Queues (`pattern-extraction-tasks`)
**Purpose**: Decoupling slow processes from user-facing API requests.
**Data Stored**:
- Asynchronous jobs (e.g., extracting long-term patterns from a user's recent history).
