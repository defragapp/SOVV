# Broker write response contract

Audited: 2026-07-08

## Runtime source of truth

`proposePR` maps to `POST /build/propose-pr` on `sovereign-broker.defrag.app`.

The operator must treat the JSON response from the broker as the only source of truth for write success. Connectivity, intent, or a submitted request body are not enough to claim a commit or PR succeeded.

## Confirmed direct-mode response

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

## Confirmed PR-mode response

```json
{
  "ok": true,
  "mode": "pr",
  "branch": "agent/<timestamp>",
  "pr_number": 123,
  "pr_url": "https://github.com/defragapp/SOVV/pull/123",
  "commits": [
    {
      "path": "docs/specs/example.md",
      "sha": "abcdef12",
      "ok": true
    }
  ]
}
```

## Success criteria

A repository write is confirmed only when all of these are true:

1. Top-level `ok` is `true`.
2. `commits[]` exists and contains at least one item.
3. Every item in `commits[]` has `ok: true`.
4. Every successful commit item includes a `sha`.
5. PR mode includes `pr_url` or `pr_number`.

If any of those fields are absent or false, the operator must report the write as unconfirmed or failed.

## Known implementation notes

- Direct mode commits to `main`.
- PR mode creates an `agent/<timestamp>` branch and opens a pull request.
- Multi-file direct mode currently creates one GitHub contents API commit per file, so recent history can show multiple commits with the same message within seconds.
- Audit persistence depends on the `LOGS` R2 binding being configured for the broker Worker.

## Recommended follow-up

Keep the broker source comments, OpenAPI action schema, and runtime behavior aligned whenever write semantics change.
