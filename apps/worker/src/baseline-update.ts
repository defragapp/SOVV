import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { getCorsHeaders } from "./cors.js";
import { sanitizeInput } from "./utils/sanitize.js";

// ── Baseline Design update flow ───────────────────────────────────────────────
// Re-run Baseline Design after major life changes.
// Preserves a history snapshot in KV before overwriting.

const BASELINE_HISTORY_KEY = (uid: string, ts: string) => `baseline-history:${uid}:${ts}`;
const BASELINE_HISTORY_INDEX_KEY = (uid: string) => `baseline-history-index:${uid}`;

interface BaselineUpdateBody {
  reason: string;
  dob?: string;
  tob?: string;
  pob?: string;
  defaultRetreat?: string;
  coreBoundary?: string;
  repairMechanic?: string;
}

export function registerBaselineUpdateRoute(router: any, getEnv: () => Env) {
  router.post("/api/baseline/update", async (request: Request) => {
    const env = getEnv();
    const cors = getCorsHeaders(request);

    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    let body: BaselineUpdateBody;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    if (!body.reason || typeof body.reason !== "string" || body.reason.trim().length < 3) {
      return new Response(JSON.stringify({ error: "reason is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const reason = sanitizeInput(body.reason.trim().slice(0, 500));

    // 1. Snapshot current baseline to history before overwriting
    try {
      const currentBaseline = await env.DB.prepare(
        "SELECT * FROM baselines WHERE user_id = ?"
      ).bind(user.id).first();

      if (currentBaseline) {
        const ts = new Date().toISOString();
        const snapshot = { ...currentBaseline, snapshotReason: reason, snapshotAt: ts };

        // Store snapshot in KV (keep last 10)
        await env.KV.put(
          BASELINE_HISTORY_KEY(user.id, ts),
          JSON.stringify(snapshot),
          { expirationTtl: 60 * 60 * 24 * 365 * 2 } // 2 years
        );

        // Update history index
        const indexRaw = await env.KV.get(BASELINE_HISTORY_INDEX_KEY(user.id));
        const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
        index.unshift(ts);
        const trimmed = index.slice(0, 10); // keep last 10 snapshots
        await env.KV.put(BASELINE_HISTORY_INDEX_KEY(user.id), JSON.stringify(trimmed));
      }
    } catch (e) {
      console.error("[baseline-update] snapshot error:", e);
      // Non-fatal — continue with update
    }

    // 2. Build update fields
    const updates: Record<string, string> = {};
    if (body.dob) updates.dob = sanitizeInput(body.dob.trim());
    if (body.tob) updates.tob = sanitizeInput(body.tob.trim());
    if (body.pob) updates.pob = sanitizeInput(body.pob.trim());
    if (body.defaultRetreat) updates.default_retreat = sanitizeInput(body.defaultRetreat.trim().slice(0, 1000));
    if (body.coreBoundary) updates.core_boundary = sanitizeInput(body.coreBoundary.trim().slice(0, 1000));
    if (body.repairMechanic) updates.repair_mechanic = sanitizeInput(body.repairMechanic.trim().slice(0, 1000));

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    // 3. Apply updates to D1
    try {
      const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(", ");
      const values = [...Object.values(updates), "not_started", new Date().toISOString(), user.id];

      await env.DB.prepare(
        `UPDATE baselines SET ${setClauses}, baseline_status = ?, updated_at = ? WHERE user_id = ?`
      ).bind(...values).run();

      // 4. Clear cached baseline from KV so it gets recomputed
      await env.KV.delete(`user-baseline:${user.id}`);
      await env.KV.delete(`user-dataset:${user.id}`);

      return new Response(JSON.stringify({
        success: true,
        message: "Baseline updated. Your design will be recomputed on next session.",
        snapshotSaved: true,
        updatedFields: Object.keys(updates),
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors },
      });
    } catch (e) {
      console.error("[baseline-update] DB error:", e);
      return new Response(JSON.stringify({ error: "Failed to update baseline" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }
  });

  // GET /api/baseline/history — list previous baseline snapshots
  router.get("/api/baseline/history", async (request: Request) => {
    const env = getEnv();
    const cors = getCorsHeaders(request);

    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const indexRaw = await env.KV.get(BASELINE_HISTORY_INDEX_KEY(user.id));
    const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];

    const snapshots = await Promise.all(
      index.map(async (ts) => {
        const raw = await env.KV.get(BASELINE_HISTORY_KEY(user.id, ts));
        if (!raw) return null;
        const snap = JSON.parse(raw);
        return {
          snapshotAt: snap.snapshotAt,
          snapshotReason: snap.snapshotReason,
          dob: snap.dob,
          pob: snap.pob,
        };
      })
    );

    return new Response(JSON.stringify({ snapshots: snapshots.filter(Boolean) }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...cors },
    });
  });
}