// apps/web/lib/api.ts

import type { ExplainRequest, ExplainResponse } from "@sovv/core/types";

export async function callExplain(
  input: ExplainRequest
): Promise<ExplainResponse> {
  try {
    const res = await fetch("/api/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const json = await res.json();

    if (!json || typeof json.type !== "string") {
      return {
        type: "error",
        message: "invalid_response_shape",
        raw: JSON.stringify(json),
      };
    }

    return json as ExplainResponse;
  } catch (err: any) {
    return {
      type: "error",
      message: "network_error",
      raw: err?.message ?? String(err),
    };
  }
}
