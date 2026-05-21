import type {
  BaselineRequest,
  BaselineResponse,
  BillingCheckoutResponse,
  ChipsResponse,
  ExplainRequest,
  ExplainResponse
} from "@sovereign/core";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export async function apiExplain(payload: ExplainRequest): Promise<ExplainResponse> {
  const res = await fetch(`${API_BASE}/api/explain`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  return res.json();
}

export async function apiChips(mode: string): Promise<ChipsResponse> {
  const res = await fetch(`${API_BASE}/api/chips?mode=${encodeURIComponent(mode)}`, {
    cache: "no-store"
  });
  return res.json();
}

export async function apiGetBaseline(): Promise<BaselineResponse> {
  const res = await fetch(`${API_BASE}/api/baseline`, { cache: "no-store" });
  return res.json();
}

export async function apiSaveBaseline(payload: BaselineRequest): Promise<BaselineResponse> {
  const res = await fetch(`${API_BASE}/api/baseline`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function apiCheckout(): Promise<BillingCheckoutResponse> {
  const res = await fetch(`${API_BASE}/api/billing/checkout`, { method: "POST" });
  return res.json();
}
