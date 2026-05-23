function todayKey() {
    const d = new Date();
    return d.toISOString().slice(0, 10); // YYYY-MM-DD UTC
}
export async function useOne(env, sid) {
    const limit = Number(env.FREE_DAILY_LIMIT || "15");
    const key = `use:${sid}:${todayKey()}`;
    const current = Number((await env.KV.get(key)) || "0");
    const next = current + 1;
    await env.KV.put(key, String(next), { expirationTtl: 60 * 60 * 36 }); // ~36h
    const remaining = Math.max(0, limit - next);
    return { ok: next <= limit, remaining };
}
//# sourceMappingURL=kv.js.map