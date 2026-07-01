import { tool } from "@openai/agents";
import { z } from "zod";
import {
  engineeringToolNames,
  type EngineeringToolCallRecord,
  type EngineeringToolName,
  type ToolClientConfig,
} from "./types";

type RecordToolCall = (record: EngineeringToolCallRecord) => void;

const toolInputSchema = z.object({
  request: z.string().min(1).max(8000),
  scope: z.string().max(2000).optional(),
});

const mutatingTools = new Set<EngineeringToolName>(["implement_change", "deploy_worker"]);

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

async function callWorkerFacade(
  name: EngineeringToolName,
  input: z.infer<typeof toolInputSchema>,
  config: ToolClientConfig,
): Promise<Record<string, unknown>> {
  if (!config.baseUrl) {
    return {
      ok: false,
      offline: true,
      tool: name,
      approvalRequired: mutatingTools.has(name),
      summary:
        "SOVV_TOOLS_BASE_URL is not configured, so the agent prepared the tool call but did not contact the Worker facade.",
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (config.sharedSecret) {
    headers["x-sovv-tools-secret"] = config.sharedSecret;
  }

  const response = await fetch(`${normalizeBaseUrl(config.baseUrl)}/tools/${name}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...input,
      approval: config.approval ?? {},
    }),
  });

  const payload = (await response.json().catch(() => ({ error: "invalid_json_response" }))) as Record<string, unknown>;
  return {
    ok: response.ok,
    status: response.status,
    tool: name,
    ...payload,
  };
}

function createFacadeTool(
  name: EngineeringToolName,
  config: ToolClientConfig,
  record: RecordToolCall,
) {
  return tool({
    name,
    description: `Call the SOVV secure Worker facade for ${name}. Do not call GitHub or Cloudflare directly.`,
    parameters: toolInputSchema,
    async execute(input) {
      const output = await callWorkerFacade(name, input, config);
      const approvalRequired = Boolean(output.approvalRequired) || mutatingTools.has(name);
      record({
        name,
        input,
        output,
        approvalRequired,
      });
      return output;
    },
  });
}

export function createEngineeringTools(config: ToolClientConfig, record: RecordToolCall) {
  return engineeringToolNames.map((name) => createFacadeTool(name, config, record));
}
