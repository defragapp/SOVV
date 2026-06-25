import type { Env } from "./types-env.js";
import { safeJsonParse, type Baseline, type BaselineRequest } from "@sovereign/core";
import { getSessionId, cookieHeader } from "./plan.js";
import { getAuthUser, verifyAccessJWT } from "./auth.js";
import { compileBaselineDataset, formatDatasetForAI, formatDatasetForApp, type BaselineDesignDataset } from "./baseline-compiler.js";
import { buildHumanBehaviorTranslation } from "./human-translation.js";

const BASELINE_KEY = (sid: string) => `baseline:${sid}`;
const DATASET_KEY  = (sid: string) => `baseline-dataset:${sid}`;
const USER_KEY     = (sid: string) => `user:${sid}`;

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

async function requireSessionAuth(req: Request, env: Env): Promise<Response | null> {
  const user = await getAuthUser(req, env.DB);
  if (user) return null;
  return verifyAccessJWT(req, env);
}

export async function getBaseline(env: Env, sid: string): Promise<Baseline | null> {
  const raw = await env.KV.get(BASELINE_KEY(sid));
  if (!raw) return null;
  return safeJsonParse<Baseline>(raw);
}

export async function getBaselineDataset(env: Env, sid: string): Promise<BaselineDesignDataset | null> {
  const raw = await env.KV.get(DATASET_KEY(sid));
  if (!raw) return null;
  return safeJsonParse<BaselineDesignDataset>(raw);
}

// Returns AI-ready context string for use in prompts
// Prefers computed dataset, falls back to raw baseline
export async function getBaselineForAI(
  env: Env,
  sid: string,
  app?: "defrag" | "alignment" | "covenant"
): Promise<string> {
  const dataset = await getBaselineDataset(env, sid);
  if (dataset?.status === "ready" && dataset.aiDataset) {
    return app ? formatDatasetForApp(dataset, app) : formatDatasetForAI(dataset);
  }
  // Fallback to raw baseline
  const baseline = await getBaseline(env, sid);
  if (!baseline) return "";
  return formatBaseline(baseline);
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
    _version: (existing as any)?._version ?? 1,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await env.KV.put(BASELINE_KEY(sid), JSON.stringify(record), { expirationTtl: 90 * 24 * 60 * 60 }); // 90 days
  await env.KV.put(
    USER_KEY(sid),
    JSON.stringify({ sid, createdAt: record.createdAt, updatedAt: record.updatedAt, baselineAt: record.updatedAt })
  );

  return record;
}

export async function handleGetBaseline(req: Request, env: Env): Promise<Response> {
  const authErr = await requireSessionAuth(req, env);
  if (authErr) return authErr;

  const sid = await getSessionId(req);
  const baseline = await getBaseline(env, sid);

  // Include dataset status if available
  let datasetStatus: string | undefined;
  if (baseline) {
    const dataset = await getBaselineDataset(env, sid);
    datasetStatus = dataset?.status;
  }

  return Response.json(
    { baseline, datasetStatus },
    {
      headers: {
        "set-cookie": cookieHeader(sid),
        "cache-control": "no-store"
      }
    }
  );
}

export async function handleSaveBaseline(req: Request, env: Env): Promise<Response> {
  const authErr = await requireSessionAuth(req, env);
  if (authErr) return authErr;

  const sid = await getSessionId(req);
  const body = (await req.json().catch(() => null)) as unknown;

  if (!isValidBaseline(body)) {
    return new Response(JSON.stringify({ error: "Invalid baseline data." }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  // Save raw baseline immediately (non-blocking)
  const baseline = await saveBaseline(env, sid, body);

  // Trigger dataset compilation in background (non-blocking)
  // This means the user is never blocked waiting for computation
  const aiModel = (env as any).AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast";

  // Store a pending dataset record immediately so the UI can show status
  const pendingDataset: BaselineDesignDataset = {
    version: "baseline.v2",
    status: "pending",
    input: {
      dob: body.dob,
      tob: body.tob.value,
      tobType: body.tob.type,
      pob: body.pob,
    },
  };
  await env.KV.put(DATASET_KEY(sid), JSON.stringify(pendingDataset), { expirationTtl: 90 * 24 * 60 * 60 }); // 90 days

  // Compile in background using waitUntil if available, otherwise fire-and-forget
  const compileAndStore = async () => {
    try {
      const dataset = await compileBaselineDataset(
        { dob: body.dob, tob: body.tob.value, tobType: body.tob.type, pob: body.pob },
        (env as any).AI,
        aiModel
      );
      await env.KV.put(DATASET_KEY(sid), JSON.stringify(dataset), { expirationTtl: 90 * 24 * 60 * 60 }); // 90 days
    } catch (err) {
      console.error("[baseline-compiler] failed:", err);
      const failedDataset: BaselineDesignDataset = {
        ...pendingDataset,
        status: "failed",
        failureReason: String(err),
      };
      await env.KV.put(DATASET_KEY(sid), JSON.stringify(failedDataset), { expirationTtl: 24 * 60 * 60 }); // 1 day (retry sooner on failure)
    }
  };

  // Fire and forget — don't await, don't block the response
  compileAndStore().catch(console.error);

  return Response.json(
    { baseline, datasetStatus: "pending" },
    {
      headers: {
        "set-cookie": cookieHeader(sid),
        "cache-control": "no-store"
      }
    }
  );
}

export function registerBaselineRoutes(router: any, getEnv: () => Env) {
  router.get("/api/baseline", async (req: Request) => handleGetBaseline(req, getEnv()));
  router.post("/api/baseline", async (req: Request) => handleSaveBaseline(req, getEnv()));

  // Translation endpoint — returns app-specific HumanBehaviorTranslation
  router.post("/api/baseline/translate", async (req: Request) => {
    const env = getEnv();
    const authErr = await requireSessionAuth(req, env);
    if (authErr) return authErr;

    const user = await getAuthUser(req, env.DB);
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const body = await req.json().catch(() => ({})) as any;
    const app = body.app as "alignment" | "defrag" | "covenant";
    if (!["alignment", "defrag", "covenant"].includes(app)) {
      return new Response(JSON.stringify({ error: "Invalid app" }), { status: 400 });
    }

    // Covenant and Alignment require Pro subscription
    if (app !== "defrag") {
      const { requireActiveSubscription } = await import("./billing.js");
      const subGate = await requireActiveSubscription(user, req);
      if (subGate) return subGate;
    }

    const translation = await buildHumanBehaviorTranslation(
      env,
      user.id,
      app,
      { refresh: body.refresh === true }
    );

    return Response.json(translation);
  });

  // Dataset status endpoint — lets the UI poll for compilation status
  router.get("/api/baseline/dataset", async (req: Request) => {
    const env = getEnv();
    const authErr = await requireSessionAuth(req, env);
    if (authErr) return authErr;

    const sid = await getSessionId(req);
    const dataset = await getBaselineDataset(env, sid);

    if (!dataset) {
      return Response.json({ status: "none" });
    }

    // Return status + aiDataset summary (not full framework data)
    return Response.json({
      status: dataset.status,
      computedAt: dataset.computedAt,
      failureReason: dataset.failureReason,
      hasAIDataset: !!dataset.aiDataset,
      identityAnchors: dataset.aiDataset?.identityAnchors ?? [],
      traitCount: dataset.aiDataset?.derivedTraits?.length ?? 0,
    });
  });
}
