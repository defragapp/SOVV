# Broker Orchestration Runtime

Status: draft contract  
Owner: Sovereign Build Operator  
Scope: SOVV / Sovereign.os / defrag.app broker control plane

## Purpose

The broker should evolve from an API wrapper into a durable orchestration runtime. ChatGPT and other clients should express intent, while the broker owns execution across GitHub, Cloudflare, Stripe, D1, KV, R2, Queues, and AI Gateway.

The primary goal is to remove terminal dependency for routine operations such as deploys, rollbacks, repository edits, production verification, and OpenAPI synchronization.

## Design Principles

1. Intent-first API. Clients request outcomes, not shell commands.
2. Durable jobs. Every long-running operation is persisted and queryable.
3. Structured events. Logs are machine-readable and phase-oriented.
4. Idempotency. Repeated requests must not duplicate sensitive operations.
5. Capability-based authorization. Each job declares the exact capabilities it needs.
6. Broker-owned orchestration. ChatGPT does not need to know GitHub REST paths, Cloudflare endpoints, Wrangler, or workflow filenames.
7. Narrow first implementation. The first deploy executor supports only deploying `sovereign-broker` from `main`.

## Job Schema

```ts
type JobStatus =
  | "queued"
  | "running"
  | "waiting"
  | "succeeded"
  | "failed"
  | "canceled";

type JobType =
  | "deploy"
  | "commit"
  | "open_pr"
  | "rollback"
  | "verify_production"
  | "sync_openapi"
  | "run_migration";

type Job = {
  id: string;
  type: JobType;
  status: JobStatus;
  intent: string;
  target: {
    surface: "broker" | "web" | "worker" | "stripe" | "d1" | "github";
    name?: string;
    ref?: string;
  };
  input: Record<string, unknown>;
  capabilities: string[];
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  created_by: "operator" | "assistant" | "system";
  idempotency_key: string;
  result?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
};
```

## Job Event Schema

```ts
type JobEvent = {
  id: string;
  job_id: string;
  ts: string;
  level: "info" | "warn" | "error" | "debug";
  phase:
    | "queued"
    | "planning"
    | "dispatching"
    | "polling"
    | "verifying"
    | "completed";
  message: string;
  data?: Record<string, unknown>;
};
```

## KV Storage Layout

Use KV first for both job metadata and events while the contract stabilizes.

```txt
jobs:{job_id}                  -> Job
jobs:idempotency:{key}         -> job_id
jobs:{job_id}:events           -> JobEvent[]
jobs:latest:{type}:{target}    -> job_id
```

Promote to D1 when filtering, dashboards, historical analytics, audit queries, or large event histories become necessary.

## Minimum HTTP API

```txt
POST /jobs
GET  /jobs/{id}
GET  /jobs/{id}/events
POST /jobs/{id}/cancel
```

All `/jobs/*` routes require broker authorization.

## First Executor: Deploy sovereign-broker From main

The first implementation must be intentionally narrow:

```json
{
  "type": "deploy",
  "intent": "Deploy the broker from main",
  "target": {
    "surface": "broker",
    "name": "sovereign-broker",
    "ref": "main"
  },
  "input": {
    "workflow": "deploy-sovereign-broker.yml",
    "confirm": "DEPLOY"
  },
  "capabilities": ["github.workflow_dispatch", "cloudflare.worker.verify"]
}
```

Execution sequence:

1. Validate request and authorization.
2. Compute or accept `idempotency_key`.
3. Check `jobs:idempotency:{key}`.
4. Create `Job(status="queued")`.
5. Append queued event.
6. Dispatch `.github/workflows/deploy-sovereign-broker.yml` with `{ ref: "main", inputs: { confirm: "DEPLOY" } }`.
7. Append dispatching event.
8. Poll GitHub workflow status when workflow-run lookup is implemented.
9. Verify Cloudflare `sovereign-broker` `modified_on` advanced.
10. Verify `/health` returns 200 and expected broker version.
11. Mark job `succeeded` or `failed` with structured result/error.

Version 1 may mark a job succeeded after GitHub returns `204` from workflow dispatch, but this must be upgraded to polling plus Cloudflare verification.

## Required Broker Primitive: Repository Patch

The current runtime can read and replace whole files, but cannot safely patch large existing files. Add one of these primitives before broad broker self-modification:

### Option A: Unified diff

```txt
POST /repo/apply-patch
```

```json
{
  "path": "apps/sovereign-gpt/broker-worker/src/index.js",
  "patch": "--- a/...\n+++ b/...\n@@ ..."
}
```

### Option B: Search/replace operations

```txt
POST /repo/edit
```

```json
{
  "path": "apps/sovereign-gpt/broker-worker/src/index.js",
  "operations": [
    {
      "type": "insert_after",
      "anchor": "async function readJson(request){try{return await request.json()}catch{return {}}}",
      "content": "..."
    }
  ]
}
```

The edit primitive must:

- reject blocked secret paths;
- require `AGENT_ENABLED` and `AGENT_WRITE_ENABLED`;
- support dry-run mode;
- return a diff preview;
- commit only when `confirm: true` is present;
- preserve current file content outside matched anchors;
- fail if an anchor is missing or appears more than once.

## OpenAPI Action Surface

Preferred GPT-facing operations after implementation:

```txt
jobsCreate
jobsGet
jobsGetEvents
jobsCancel
repoReadFile
repoListFiles
repoListCommits
repoListPullRequests
repoApplyPatch
repoEdit
```

## Implementation Order

1. Add `repo.edit` or `repo.applyPatch` primitive.
2. Use that primitive to patch broker source safely.
3. Add `/jobs` KV-backed runtime.
4. Add deploy sovereign-broker executor.
5. Add workflow run polling.
6. Add Cloudflare deployment verification.
7. Add `sync_openapi` job.
8. Add rollback executor.

## Non-goals for V1

- Generic arbitrary command execution.
- Shell access.
- Destructive operations.
- Database migrations.
- Stripe writes.
- Multi-worker deploy orchestration.

## Completion Criteria

The orchestration runtime is considered V1-complete when an authorized client can create a `deploy sovereign-broker from main` job, retrieve job status, retrieve structured job events, and receive a definitive success/failure result without terminal access.
