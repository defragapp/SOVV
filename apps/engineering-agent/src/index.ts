import { Agent, run } from "@openai/agents";
import { createEngineeringTools } from "./tools";
import {
  engineeringChatInputSchema,
  type EngineeringChatInput,
  type EngineeringChatOutput,
  type EngineeringToolCallRecord,
} from "./types";

export * from "./types";

const MODE_INSTRUCTIONS: Record<EngineeringChatInput["mode"], string> = {
  architect:
    "Focus on architecture, risk, sequencing, and smallest safe vertical slices. Prefer read-first analysis before implementation.",
  developer:
    "Focus on implementation details, scoped patches, tests, and reversible changes. Never deploy or mutate production without approval.",
  reviewer:
    "Focus on pull request review, regressions, safety gaps, missing tests, and release blockers.",
  release:
    "Focus on release readiness, production drift, verification, rollback plans, and explicit approval gates.",
};

function buildInstructions(mode: EngineeringChatInput["mode"]): string {
  return [
    "You are the SOVV Engineering Chat.",
    "You operate only through these high-level tools: audit_repository, implement_change, prepare_release, review_pull_request, deploy_worker, verify_production.",
    "Never call GitHub, Cloudflare, Stripe, R2, or any production service directly. The secure Worker facade owns credentials and external API calls.",
    "Keep secrets out of prompts, answers, logs, tool inputs, and code suggestions.",
    "Do not deploy, merge, rotate secrets, change routes, or mutate production unless the user gives explicit approval and the relevant approval gate passes.",
    "Separate verified facts from assumptions. Prefer incremental, reversible changes.",
    MODE_INSTRUCTIONS[mode],
  ].join("\n");
}

function buildPrompt(input: EngineeringChatInput): string {
  return [
    `Mode: ${input.mode}`,
    input.sessionId ? `Session: ${input.sessionId}` : null,
    "User request:",
    input.message,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function fallbackAnswer(input: EngineeringChatInput): EngineeringChatOutput {
  return {
    answer:
      "SOVV Engineering Chat is wired, but OPENAI_API_KEY is not configured for the server runtime yet. Configure OPENAI_API_KEY plus SOVV_TOOLS_BASE_URL to enable live agent runs through the Worker facade.",
    toolCalls: [
      {
        name: "audit_repository",
        input: { request: input.message, scope: input.mode },
        output: {
          ok: false,
          offline: true,
          summary: "Agent runtime not configured. No repository, GitHub, Cloudflare, or production mutation was attempted.",
        },
        approvalRequired: false,
      },
    ],
    approvalRequired: false,
  };
}

export async function runEngineeringAgent(rawInput: unknown): Promise<EngineeringChatOutput> {
  const input = engineeringChatInputSchema.parse(rawInput);
  const toolCalls: EngineeringToolCallRecord[] = [];

  if (!process.env.OPENAI_API_KEY) {
    return fallbackAnswer(input);
  }

  const tools = createEngineeringTools(
    {
      baseUrl: process.env.SOVV_TOOLS_BASE_URL,
      sharedSecret: process.env.SOVV_TOOLS_SHARED_SECRET,
      approval: {
        approved: input.approved,
        phrase: input.approvalPhrase,
      },
    },
    (record) => toolCalls.push(record),
  );

  const agent = new Agent({
    name: `SOVV Engineering Chat / ${input.mode}`,
    model: process.env.SOVV_ENGINEERING_MODEL ?? "gpt-5.5",
    instructions: buildInstructions(input.mode),
    tools,
  });

  const result = await run(agent, buildPrompt(input));
  const finalOutput = (result as { finalOutput?: unknown }).finalOutput;
  const answer = typeof finalOutput === "string" ? finalOutput : JSON.stringify(finalOutput ?? "");

  return {
    answer,
    toolCalls,
    approvalRequired: toolCalls.some((call) => call.approvalRequired),
  };
}
