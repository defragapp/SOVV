import { NextResponse } from "next/server";
import { runEngineeringAgent } from "@sovv/engineering-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ErrorPayload = {
  answer: string;
  toolCalls: never[];
  approvalRequired: false;
  error: string;
};

function errorResponse(message: string, status = 400) {
  const payload: ErrorPayload = {
    answer: message,
    toolCalls: [],
    approvalRequired: false,
    error: message,
  };
  return NextResponse.json(payload, { status });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON request body.");
  }

  try {
    const output = await runEngineeringAgent(body);
    return NextResponse.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Engineering agent request failed.";
    return errorResponse(message, 500);
  }
}
