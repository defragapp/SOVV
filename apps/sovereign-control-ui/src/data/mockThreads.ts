import type { Thread } from "../types.ts"

export const MOCK_THREADS: Thread[] = [
  {
    id: "t1",
    title: "Inspect defrag workspace",
    mode: "inspect",
    createdAt: "2026-06-19T20:00:00Z",
    updatedAt: "2026-06-19T20:05:00Z",
    messages: [
      {
        id: "m1",
        role: "user",
        type: "text",
        content: "inspect apps/web/app/apps/defrag/workspace/page.tsx",
        timestamp: "2026-06-19T20:00:00Z",
      },
      {
        id: "m2",
        role: "assistant",
        type: "meta",
        content: "Inspecting defrag workspace page...",
        timestamp: "2026-06-19T20:00:01Z",
        meta: { tool: "inspect_repo", path: "apps/web/app/apps/defrag/workspace/page.tsx", lines: 440 },
      },
    ],
  },
  {
    id: "t2",
    title: "Deploy API Worker",
    mode: "deploy",
    createdAt: "2026-06-19T19:00:00Z",
    updatedAt: "2026-06-19T19:10:00Z",
    messages: [
      {
        id: "m3",
        role: "user",
        type: "text",
        content: "deploy sovereign-os-api",
        timestamp: "2026-06-19T19:00:00Z",
      },
      {
        id: "m4",
        role: "assistant",
        type: "action",
        content: "Deploy requires confirmation. Risk: high.",
        timestamp: "2026-06-19T19:00:02Z",
        meta: { tool: "deploy_worker", risk: "high", requiresConfirm: true },
      },
    ],
  },
  {
    id: "t3",
    title: "Review /apps/defrag live",
    mode: "inspect",
    createdAt: "2026-06-19T18:00:00Z",
    updatedAt: "2026-06-19T18:05:00Z",
    messages: [
      {
        id: "m5",
        role: "user",
        type: "text",
        content: "screenshot https://app.defrag.app/apps/defrag",
        timestamp: "2026-06-19T18:00:00Z",
      },
      {
        id: "m6",
        role: "assistant",
        type: "meta",
        content: "Browser Run not yet configured. Add BROWSER binding to wrangler.toml.",
        timestamp: "2026-06-19T18:00:02Z",
        meta: { status: "not_enabled" },
      },
    ],
  },
]
