import type { Env } from "./types-env.js";
import type { Baseline, BaselineRequest } from "@sovereign/core";
import { safeJsonParse } from "@sovereign/core";
import { getSessionId, cookieHeader } from "./plan.js";

const BASELINE_KEY = (sid: string) => `baseline:${sid}`;
const USER_KEY = (sid: string) => `user:${sid}`;

function isValidBaseline(data: unknown): data is BaselineRequest {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as any).dob === "string" &&
    (data as any).dob.trim().length > 0 &&
    typeof (data as any).pob === "string" &&
    (data as any).pob.trim().length > 0 &&
    typeof (data as any).tob === "object" &&
    data !== null &&
    ((data as any).tob.type === "exact" || (data as any).tob.type === "approx") &&
    typeof (data as any).tob.value === "string" &&
    (data as any).tob.value.trim().length > 0
  );
}

export async function getBaseline(env: Env, sid: string): Promise<Baseline | null> {
  const raw = await env.KV.get(BASELINE_KEY(sid));
  if (!raw) return null;
  return safeJsonParse<Baseline>(raw);
}

export function formatBaseline(baseline: Baseline): string {
  const tob = baseline.tob.type === "exact" ? baseline.tob.value : `Approx ${baseline.tob.value}`;
  return `DOB: ${baseline.dob}\nTOB: ${tob}\nPOB: ${baseline.pob}`;
}

export async function saveBaseline(env: Env, sid: string, baseline: BaselineRequest): Promise<Baseline> {
  const existing = await getBaseline(env, sid);
  const now = Date.now();
  const record: Baseline = {
    ...baseline,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };

  await env.KV.put(BASELINE_KEY(sid), JSON.stringify(record));
  await env.KV.put(
    USER_KEY(sid),
    JSON.stringify({ sid, createdAt: record.createdAt, updatedAt: record.updatedAt, baselineAt: record.updatedAt })
  );

  return record;
}

export async function handleGetBaseline(req: Request, env: Env): Promise<Response> {
  const sid = await getSessionId(req);
  const baseline = await getBaseline(env, sid);
  return Response.json(
    { baseline },
    {
      headers: {
        "set-cookie": cookieHeader(sid),
        "cache-control": "no-store"
      }
    }
  );
}

export async function handleSaveBaseline(req: Request, env: Env): Promise<Response> {
  const sid = await getSessionId(req);
  const body = (await req.json().catch(() => null)) as unknown;

  if (!isValidBaseline(body)) {
    return new Response(JSON.stringify({ error: "Invalid baseline data." }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  const baseline = await saveBaseline(env, sid, body);
  return Response.json(
    { baseline },
    {
      headers: {
        "set-cookie": cookieHeader(sid),
        "cache-control": "no-store"
      }
    }
  );
}
