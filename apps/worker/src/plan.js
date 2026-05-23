export async function getSessionId(req) {
    const cookie = req.headers.get("Cookie") || "";
    const match = cookie.match(/sid=([a-zA-Z0-9_-]+)/);
    if (match)
        return match[1] ?? "";
    return crypto.randomUUID().replace(/-/g, "");
}
export async function getPlan(env, sid) {
    const v = await env.KV.get(`plan:${sid}`);
    return v === "pro" ? "pro" : "free";
}
export async function setPlan(env, sid, plan) {
    await env.KV.put(`plan:${sid}`, plan);
}
export function cookieHeader(sid) {
    // Secure + SameSite for production; HttpOnly is fine because we don't need JS access.
    return `sid=${sid}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`;
}
//# sourceMappingURL=plan.js.map