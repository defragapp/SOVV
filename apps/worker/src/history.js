import { getSessionId, cookieHeader } from "./plan.js";
import { verifyAccessJWT } from "./auth.js";
import { mapInteraction } from "./db.js";
export async function handleHistory(req, env) {
    const user = await verifyAccessJWT(req);
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }
    const sid = await getSessionId(req);
    if (!sid) {
        return Response.json({ interactions: [] });
    }
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);
    try {
        const { results } = await env.DB.prepare("SELECT * FROM interactions WHERE session_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?")
            .bind(sid, limit, offset)
            .all();
        const interactions = (results ?? []).map(mapInteraction);
        return Response.json({ interactions }, { headers: { "set-cookie": cookieHeader(sid), "cache-control": "no-store" } });
    }
    catch (e) {
        console.error("Failed to fetch history", String(e));
        return Response.json({ interactions: [] });
    }
}
//# sourceMappingURL=history.js.map