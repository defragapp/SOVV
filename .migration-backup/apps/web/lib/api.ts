import type { Baseline, BaselineRequest, ExplainRequest, ExplainResponse } from "@sovereign/core";

export async function apiGetBaseline(): Promise<{ baseline: Baseline | null }> {
  const res = await fetch("/api/baseline", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    return { baseline: null };
  }

  return res.json();
}

export async function apiSaveBaseline(
  baseline: BaselineRequest
): Promise<{ baseline: Baseline | null }> {
  const res = await fetch("/api/baseline", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(baseline),
  });

  if (!res.ok) {
    return { baseline: null };
  }

  return res.json();
}

export async function callExplain(input: ExplainRequest): Promise<ExplainResponse> {
  const res = await fetch("/api/explain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  return res.json();
}
