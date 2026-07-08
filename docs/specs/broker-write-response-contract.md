# Broker write response contract

Audited: 2026-07-08

## Observed runtime behavior

`proposePR` maps to `POST /build/propose-pr` on `sovereign-broker.defrag.app`.

The broker returns a JSON envelope that should be treated as the only source of truth for write success:

```json
{
  "ok": true,
  "mode": "direct",
  "branch": "main",
  "commits": [
    {
      "path": "apps/web/app/page.tsx",
      "sha": "abcdef12",
      "url": "https://github.com/defragapp/SOVV/blob/main/apps/web/app/page.tsx",
      "ok": true
    }
  ],
  "message": "1 file(s) committed directly to main."
}
```

For PR mode, success is expected to include:

```json
{
  "ok": true,
  "mode": "pr",
  "branch": "agent/<timestamp>",
  "pr_number": 123,
  "pr_url": "https://github.com/defragapp/SOVV/pull/123",
  "commits": [
    { "path": "docs/specs/example.md", "sha": "abcdef12", "ok": true }
  ]
}
```

## Success criteria for the operator

A write is confirmed only when:

1. Top-level `ok` is `true`.
2. Every item in `commits[]` has `ok: true`.
3. Direct mode includes `branch: "main"` and at least one commit SHA.
4. PR mode includes `pr_url` or `pr_number` and at least one commit SHA.

If any of those fields are missing, the operator must not infer success from intent or from prior tool connectivity.

## Mismatches found

- The broker source comments say all writes require `confirm: true`, but `handleProposePR` does not check `body.confirm`.
- The OpenAPI description says direct main commits are permanently blocked, but the runtime supports direct commits and defaults to direct mode.
- The OpenAPI `ProposePRRequest` schema does not include `confirm`, which matches current runtime behavior but conflicts with the safety-model description.
- Multi-file direct mode writes one GitHub contents commit per file. This can produce multiple commits with the same message within seconds, which makes recent history look duplicated.

## Recommended runtime fix

1. Pick one policy and make implementation + OpenAPI match it.
2. For ChatGPT tool compatibility, either:
   - keep operator-turn authorization and do not require a `confirm` field for `proposePR`, or
   - add `confirm` to the OpenAPI action schema and to the tool surface.
3. Return a normalized response object for all write operations:

```ts
type WriteResponse = {
  ok: boolean;
  operation: "proposePR" | "deployWorker" | "kvSet" | "createPrice";
  mode?: "direct" | "pr";
  branch?: string;
  commits?: Array<{ path: string; ok: boolean; sha?: string; url?: string; error?: string }>;
  pr_number?: number;
  pr_url?: string;
  error?: string;
  blocked?: boolean;
  reason?: string;
};
```

4. For direct multi-file writes, prefer a single Git tree commit instead of one GitHub contents API commit per file, or clearly document one-commit-per-file behavior.
