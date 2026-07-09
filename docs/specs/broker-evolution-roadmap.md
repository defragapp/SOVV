# Broker Evolution: Strategic Roadmap

## Current State (v2.6)

- KV-backed job orchestration
- Protected `/jobs` endpoints
- OpenAPI contract aligned
- GitHub workflow dispatch
- Durable state with events
- Limited to deploy executor
- No self-editing capability yet
- Service logic still scattered across route handlers

## Priority 1 — Repository Editing Runtime

Repository editing is the next highest-leverage capability because it unlocks autonomous self-evolution. Once the broker can safely edit its own repo through verifiable patches, it can improve itself incrementally without relying on local terminal access or whole-file replacement.

### Routes

```txt
POST /repo/edit
POST /repo/apply-patch
GET  /repo/diff/{id}
```

### Required Features

- Anchor-based edits: `insert_after`, `insert_before`, `replace_exact`
- Unified diff application
- Dry-run mode
- Diff preview
- Protected path blocking for secrets, keys, credentials, and private files
- Explicit `confirm: true` before commit
- Atomic GitHub commit to `main`
- Returned commit SHA
- KV-backed diff history for review and rollback

### Expected Impact

This is the capability that transforms the broker from an API wrapper into a self-evolving control plane.

## Priority 2 — Job Engine Generalization

Current deploy logic is specialized. Move toward a pluggable executor model:

```ts
executors[type].run(job)
```

Target executors:

- `deploy`
- `commit`
- `open_pr`
- `rollback`
- `verify`
- `sync_openapi`

## Priority 3 — GitHub Service Layer

Consolidate GitHub logic into a single internal service layer:

```ts
dispatchWorkflow()
createCommit()
createBranch()
openPullRequest()
waitForWorkflow()
readFile()
applyPatch()
compare()
merge()
```

This reduces route-level duplication and makes the job engine easier to test.

## Priority 4 — Cloudflare Service Layer

Centralize Cloudflare operations:

```ts
verifyDeployment()
workerMetadata()
deployStatus()
kv()
d1()
queues()
r2()
ai()
```

## Priority 5 — Execution Graph

Represent workflows as composable execution nodes instead of long linear handlers.

Example deploy graph:

```txt
DispatchWorkflow
  -> WaitForWorkflow
  -> VerifyWorker
  -> VerifyHealth
  -> Complete
```

Future graph:

```txt
Commit
  -> OpenPR
  -> Merge
  -> Deploy
  -> SmokeTests
  -> Complete
```

## Priority 6 — Event Streaming

Add Server-Sent Events for job updates:

```txt
GET /jobs/{id}/stream
```

This gives clients real-time job progress without polling.

## Priority 7 — Production Verification

Every deployment should verify:

- GitHub workflow completed
- Cloudflare Worker metadata changed
- Health endpoint responds
- Expected version is live
- OpenAPI contract remains reachable
- Smoke tests pass

## Priority 8 — Capability Registry

Add a self-describing capability endpoint:

```txt
GET /capabilities
```

Example response:

```json
{
  "jobs": true,
  "repo.edit": false,
  "repo.patch": false,
  "github.workflow_dispatch": true,
  "github.commit": true,
  "github.pr": false,
  "cloudflare.verify": true,
  "deploy": true,
  "rollback": false
}
```

## Recommended Sequence

1. Repository Editing Runtime
2. GitHub and Cloudflare service layers
3. Job engine generalization
4. Execution graph
5. Production verification
6. Event streaming
7. Capability registry

## Architectural Shift

### Current

```txt
Broker = REST API wrapper collection
├─ /repo/* -> GitHub API
├─ /cf/* -> Cloudflare API
├─ /ai/* -> Workers AI
├─ /stripe/* -> Stripe API
└─ /jobs -> deploy orchestration
```

### Target

```txt
Broker = Autonomous Control Plane
├─ Service Layer
├─ Executor Framework
├─ Execution Graph
├─ Repository Editing
├─ Event Streaming
├─ Verification Suite
└─ Capability Registry
```

## Why Repository Editing Runtime First

1. It unlocks autonomy.
2. It enables safe, small patches instead of whole-file replacement.
3. It provides the foundation for every future broker improvement.
4. It creates a self-bootstrapping path for the control plane.
5. It has the highest leverage relative to implementation size.
