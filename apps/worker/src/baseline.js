import { safeJsonParse } from "@sovereign/core";
import { getSessionId, cookieHeader } from "./plan.js";
import { verifyAccessJWT } from "./auth.js";
const BASELINE_KEY = (sid) => `baseline:${sid}`;
const USER_KEY = (sid) => `user:${sid}`;
function isValidBaseline(data) {
    return (typeof data === "object" &&
        data !== null &&
        typeof data.dob === "string" &&
        data.dob.trim().length > 0 &&
        typeof data.pob === "string" &&
        data.pob.trim().length > 0 &&
        typeof data.tob === "object" &&
        data !== null &&
        (data.tob.type === "exact" || data.tob.type === "approx") &&
        typeof data.tob.value === "string" &&
        data.tob.value.trim().length > 0);
}
export async function getBaseline(env, sid) {
    const raw = await env.KV.get(BASELINE_KEY(sid));
    if (!raw)
        return null;
    return safeJsonParse(raw);
}
export function formatBaseline(baseline) {
    const tob = baseline.tob.type === "exact" ? baseline.tob.value : `Approx ${baseline.tob.value}`;
    return `DOB: ${baseline.dob}\nTOB: ${tob}\nPOB: ${baseline.pob}`;
}
export async function saveBaseline(env, sid, baseline) {
    const existing = await getBaseline(env, sid);
    const now = Date.now();
    const record = {
        ...baseline,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now
    };
    await env.KV.put(BASELINE_KEY(sid), JSON.stringify(record));
    await env.KV.put(USER_KEY(sid), JSON.stringify({ sid, createdAt: record.createdAt, updatedAt: record.updatedAt, baselineAt: record.updatedAt }));
    return record;
}
export async function handleGetBaseline(req, env) {
    const user = await verifyAccessJWT(req);
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }
    const sid = await getSessionId(req);
    const baseline = await getBaseline(env, sid);
    return Response.json({ baseline }, {
        headers: {
            "set-cookie": cookieHeader(sid),
            "cache-control": "no-store"
        }
    });
}
export async function handleSaveBaseline(req, env) {
    const user = await verifyAccessJWT(req);
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }
    const sid = await getSessionId(req);
    const body = (await req.json().catch(() => null));
    if (!isValidBaseline(body)) {
        return new Response(JSON.stringify({ error: "Invalid baseline data." }), {
            status: 400,
            headers: { "content-type": "application/json" }
        });
    }
    const baseline = await saveBaseline(env, sid, body);
    return Response.json({ baseline }, {
        headers: {
            "set-cookie": cookieHeader(sid),
            "cache-control": "no-store"
        }
    });
}
//# sourceMappingURL=baseline.js.map