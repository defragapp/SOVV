import { z } from "zod";

export const engineeringModes = ["architect", "developer", "reviewer", "release"] as const;
export const engineeringToolNames = [
  "audit_repository",
  "implement_change",
  "prepare_release",
  "review_pull_request",
  "deploy_worker",
  "verify_production",
] as const;

export type EngineeringMode = (typeof engineeringModes)[number];
export type EngineeringToolName = (typeof engineeringToolNames)[number];

export const engineeringChatInputSchema = z.object({
  message: z.string().min(1).max(8000),
  mode: z.enum(engineeringModes).default("architect"),
  sessionId: z.string().optional(),
  approved: z.boolean().optional(),
  approvalPhrase: z.string().optional(),
});

export type EngineeringChatInput = z.infer<typeof engineeringChatInputSchema>;

export interface EngineeringToolCallRecord {
  name: EngineeringToolName;
  input: Record<string, unknown>;
  output: unknown;
  approvalRequired: boolean;
}

export interface EngineeringChatOutput {
  answer: string;
  toolCalls: EngineeringToolCallRecord[];
  approvalRequired: boolean;
}

export interface ToolApprovalInput {
  approved?: boolean;
  phrase?: string;
}

export interface ToolClientConfig {
  baseUrl?: string;
  sharedSecret?: string;
  approval?: ToolApprovalInput;
}
