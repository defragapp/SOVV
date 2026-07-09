# Repository Editing Runtime Specification

Status: implementation-ready draft  
Scope: `sovereign-broker` protected repository editing endpoints

## Purpose

The repository editing runtime allows the broker to safely modify files in the SOVV repository using small, verifiable edits instead of full-file replacement. This is required for autonomous broker evolution and safe incremental development from ChatGPT.

## Routes

```txt
POST /repo/edit
POST /repo/apply-patch
GET  /repo/diff/{id}
```

All routes require broker authorization.

## Safety Requirements

The implementation must:

- require `AGENT_ENABLED=true`
- require `AGENT_WRITE_ENABLED=true` for confirmed commits
- block paths matching the existing secret/path denylist
- reject edits to `.env`, `.dev.vars`, credentials, private keys, secrets, and identity files
- support `dry_run: true`
- require `confirm: true` before committing
- fail if an anchor is missing
- fail if an anchor appears more than once
- return a unified diff preview
- commit atomically to `main`
- return commit SHA and changed paths
- never log file contents that match blocked paths

## POST /repo/edit

Anchor-based edit API.

### Request

```json
{
  "path": "apps/sovereign-gpt/broker-worker/src/index.js",
  "dry_run": true,
  "confirm": false,
  "message": "feat: add repo edit primitive",
  "operations": [
    {
      "type": "insert_after",
      "anchor": "async function readJson(request){try{return await request.json()}catch{return {}}}",
      "content": "\nfunction example(){return true}\n"
    }
  ]
}
```

### Operation Types

#### `insert_after`

Insert `content` immediately after a unique `anchor`.

```json
{
  "type": "insert_after",
  "anchor": "const x = 1;",
  "content": "\nconst y = 2;"
}
```

#### `insert_before`

Insert `content` immediately before a unique `anchor`.

```json
{
  "type": "insert_before",
  "anchor": "export default",
  "content": "\nfunction helper(){}\n"
}
```

#### `replace_exact`

Replace one exact unique string with another.

```json
{
  "type": "replace_exact",
  "anchor": "state: \"queued\"",
  "content": "status: \"queued\""
}
```

### Response: Dry Run

```json
{
  "ok": true,
  "dry_run": true,
  "path": "apps/sovereign-gpt/broker-worker/src/index.js",
  "diff_id": "diff_abc123",
  "diff": "--- a/apps/...\n+++ b/apps/...\n@@ ...",
  "operations_applied": 1
}
```

### Response: Confirmed Commit

```json
{
  "ok": true,
  "dry_run": false,
  "committed": true,
  "path": "apps/sovereign-gpt/broker-worker/src/index.js",
  "commit_sha": "abc12345",
  "url": "https://github.com/defragapp/SOVV/commit/abc12345",
  "operations_applied": 1
}
```

## POST /repo/apply-patch

Unified diff patch API.

### Request

```json
{
  "dry_run": true,
  "confirm": false,
  "message": "feat: patch broker jobs runtime",
  "patch": "--- a/apps/sovereign-gpt/broker-worker/src/index.js\n+++ b/apps/sovereign-gpt/broker-worker/src/index.js\n@@ ..."
}
```

### Rules

- Patch may touch multiple files.
- Every file path must pass the existing denylist check.
- Dry run must return the computed final diff without committing.
- Confirmed commit must update every changed file in one logical operation.
- If any file fails validation, the whole patch fails.

## GET /repo/diff/{id}

Retrieve a stored dry-run diff.

### Response

```json
{
  "ok": true,
  "id": "diff_abc123",
  "created_at": "2026-07-09T00:00:00Z",
  "paths": ["apps/sovereign-gpt/broker-worker/src/index.js"],
  "diff": "--- a/...\n+++ b/..."
}
```

## KV Layout

```txt
repo:diff:{id}          -> diff preview object
repo:edit:latest        -> latest diff id
repo:edit:history:{day} -> compact audit index
```

## Implementation Notes

Use existing broker primitives:

- `ghFetch()` to read and commit files
- `isPathBlocked()` for denylist enforcement
- `auditLog()` for confirmed edit commits
- `authenticate()` route gate
- `AGENT_ENABLED` and `AGENT_WRITE_ENABLED` flags

The first implementation should support `/repo/edit` before `/repo/apply-patch` because anchor-based edits are simpler and safer than generic patch application.

## Acceptance Tests

### Dry Run Insert

- Given a valid path and unique anchor
- When `dry_run: true`
- Then no GitHub commit is created
- And a unified diff is returned
- And a `repo:diff:{id}` object is stored

### Confirmed Insert

- Given the same request with `confirm: true`
- Then the file is committed to `main`
- And the response includes commit SHA and URL

### Missing Anchor

- Given an anchor that does not appear
- Then the request fails with 400
- And no commit is created

### Duplicate Anchor

- Given an anchor that appears more than once
- Then the request fails with 400
- And no commit is created

### Blocked Path

- Given a blocked path such as `.env`
- Then the request fails with 403
- And the path content is never read, logged, or committed

## Non-goals for V1

- Arbitrary shell commands
- Large refactors
- Semantic AST edits
- Secret file editing
- Automatic PR review
- Cross-repo edits
