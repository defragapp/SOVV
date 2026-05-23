import { safeJsonParse } from "@sovereign/core";
import { flatChips } from "@sovereign/core";
import { safetyMode, supportResponse } from "./safety.js";
import { SYSTEM_RULES, buildUserPrompt } from "./prompt.js";
import { getSessionId, getPlan, cookieHeader } from "./plan.js";
import { useOne } from "./kv.js";
import { getBaseline, formatBaseline } from "./baseline.js";
import { verifyAccessJWT } from "./auth.js";
import { insertInteraction, getPatterns, formatPatternsForPrompt } from "./db.js";
async function hash(text) {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
function fallbackResult() {
    return {
        whatsGoingOn: "I may not have enough detail to explain this clearly yet.",
        whyRepeating: "A bit more context would help identify what is repeating.",
        nextStep: "Add what happened right before and right after.",
        frame: "The moment is still forming.",
        pressure: "Insufficient detail to name the pressure.",
        activation: "Internal state unclear.",
        rising: "Observation requires more context.",
        field: "Relational dynamic unknown.",
        shift: "What steadies you requires more detail.",
        opening: "Observe how the story opens.",
        limits: "If there is safety risk or ongoing disrespect, get support first.",
        confidence: "Low",
    };
}
function audioScript(r) {
    return `What's happening: ${r.frame}\n\nWhat this is pressing on: ${r.pressure}\n\nWhat's getting activated: ${r.activation}\n\nWhat steadies you: ${r.shift}\n\nWhat opens the story: ${r.opening}`;
}
function videoScenes(r) {
    return [
        { type: "messages", title: "What's happening", text: r.frame, seconds: 8 },
        { type: "pattern", title: "What's activated", text: r.activation, seconds: 10 },
        { type: "rewrite", title: "From their side", text: r.field, seconds: 7 },
        { type: "action", title: "What steadies you", text: r.shift, seconds: 8 },
        { type: "confidence", title: "Confidence", text: r.confidence, seconds: 4 },
    ];
}
function isValidExplainRequest(body) {
    if (typeof body !== "object" || body === null)
        return false;
    // This is a basic check. For more complex validation, a library like Zod would be beneficial.
    const req = body;
    return (typeof req.question === "string" || typeof req.question === "undefined");
}
export async function handleExplain(req, env, ctx) {
    const user = await verifyAccessJWT(req);
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }
    const sid = await getSessionId(req);
    const plan = await getPlan(env, sid);
    const freeLimit = Number(env.FREE_DAILY_LIMIT || "15");
    const remainingToday = plan === "free" ? freeLimit : 9999;
    const body = await req.json().catch(() => null);
    if (!isValidExplainRequest(body)) {
        return new Response("Invalid request body.", { status: 400 });
    }
    const input = {
        mode: body.mode || "self",
        question: body.question || "",
        text: body.text || "",
        people: body.people || [],
    };
    const baseline = await getBaseline(env, sid);
    if (!baseline) {
        return Response.json({
            type: "needs_baseline",
            requestId: crypto.randomUUID(),
            mode: input.mode,
            plan,
            message: "Hidden baseline context is required. Visit Settings to add your DOB, TOB, and POB.",
            limits: { remainingToday },
        }, {
            headers: { "set-cookie": cookieHeader(sid), "cache-control": "no-store" },
        });
    }
    if (plan === "free") {
        const usage = await useOne(env, sid);
        const rateLimit = env.RATE_LIMITER
            ? await env.RATE_LIMITER.limit({ key: sid })
            : { success: true, remaining: 999 };
        if (!usage.ok || !rateLimit.success) {
            return Response.json({
                type: "ok",
                requestId: crypto.randomUUID(),
                mode: input.mode,
                result: {
                    whatsGoingOn: "You've hit today's free limit.",
                    whyRepeating: "This keeps the free tier reliable for everyone.",
                    nextStep: "Try again tomorrow or upgrade to Pro.",
                    limits: "If you're in immediate risk, use support resources first.",
                    confidence: "Not enough information",
                    frame: "Limit reached.",
                    pressure: "Daily execution capped.",
                    activation: "Maintain system integrity.",
                    rising: "Expansion paused.",
                    field: "Access restricted.",
                    shift: "Return tomorrow.",
                    opening: "Elevate to Pro.",
                },
                chips: ["Upgrade to Pro", "Try again tomorrow"],
                audio: { title: "Overview", script: "Free limit reached.", format: "overview" },
                video: { format: "vertical", scenes: [] },
                confidence: "Not enough information",
                plan,
                limits: { remainingToday: usage.ok ? rateLimit.remaining : usage.remaining },
            }, { status: 429 });
        }
    }
    if (safetyMode(input.text || "") === "support") {
        const resp = supportResponse();
        return Response.json(resp, {
            headers: { "set-cookie": cookieHeader(sid) },
        });
    }
    const requestId = crypto.randomUUID();
    // ─── AI Response Cache (Cost Optimization) ───
    const cacheKey = `explain:${sid}:${await hash(input.text || "")}`;
    const cached = await env.KV.get(cacheKey);
    if (cached) {
        return Response.json(JSON.parse(cached), { headers: { "set-cookie": cookieHeader(sid) } });
    }
    // ─── Memory Layer: Fetch known patterns ───
    let memoryContext = "";
    try {
        const patterns = await getPatterns(env.DB, sid);
        memoryContext = formatPatternsForPrompt(patterns);
    }
    catch {
        // D1 not available or table missing — continue without memory
    }
    // Build prompt with memory context injected
    const userPrompt = buildUserPrompt({
        mode: input.mode,
        question: input.question || "Explain this",
        text: input.text || "",
        people: input.people || [],
        baselineContext: formatBaseline(baseline),
    });
    const fullUserPrompt = memoryContext
        ? `${memoryContext}\n\n${userPrompt}`
        : userPrompt;
    const modelId = env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast";
    const ai = await env.AI.run(modelId, {
        messages: [
            { role: "system", content: SYSTEM_RULES },
            { role: "user", content: fullUserPrompt },
        ],
        temperature: 0.2,
        max_tokens: 350,
    });
    const parsed = safeJsonParse(String(ai.response ?? ""));
    const result = parsed ?? fallbackResult();
    const chips = flatChips(input.mode).slice(0, 12);
    const response = {
        type: "ok",
        requestId,
        mode: input.mode,
        result,
        chips,
        audio: { title: "Audio overview", script: audioScript(result), format: "overview" },
        video: { format: "vertical", scenes: videoScenes(result) },
        confidence: result.confidence,
        plan,
        limits: { remainingToday },
    };
    // Store result in cache
    await env.KV.put(cacheKey, JSON.stringify(response), { expirationTtl: 3600 });
    ctx.waitUntil((async () => {
        try {
            await insertInteraction(env.DB, {
                id: requestId,
                session_id: sid,
                mode: input.mode,
                question: input.question,
                text: input.text,
                people: input.people,
                result,
                confidence: result.confidence || "Low",
            });
            await extractPatterns(env, sid, requestId);
        }
        catch {
            // Non-critical
        }
    })());
    return Response.json(response, {
        headers: { "set-cookie": cookieHeader(sid), "cache-control": "no-store" },
    });
}
//# sourceMappingURL=explain.js.map