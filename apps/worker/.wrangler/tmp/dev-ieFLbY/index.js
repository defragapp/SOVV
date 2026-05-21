var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-PoB9kw/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// ../../packages/core/src/util.ts
function safeJsonParse(input) {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}
__name(safeJsonParse, "safeJsonParse");

// ../../packages/core/src/chips.ts
var CHIP_GROUPS = {
  self: [
    {
      title: "Steadier self",
      chips: [
        "What does steady look like for me in conflict?",
        "What helps me respond without over-explaining?",
        "What boundary sentence fits me?"
      ]
    },
    {
      title: "Unhelpful patterns",
      chips: [
        "What do I do that escalates things without meaning to?",
        "What do I do when I feel cornered?",
        "What am I protecting when I get intense?"
      ]
    },
    {
      title: "Family patterns",
      chips: [
        "What role did I learn to play growing up?",
        "Where did I learn to carry too much?",
        "What keeps repeating across different people?"
      ]
    },
    {
      title: "How I land on others",
      chips: [
        "How might people experience me when I\u2019m stressed?",
        "What do others misunderstand about my intent?",
        "Where might I be trying to control because I feel unsafe?"
      ]
    }
  ],
  situation: [
    {
      title: "Next message",
      chips: [
        "Rewrite my message so it stays honest and calm",
        "What should I say next in one sentence?",
        "What should I stop saying right now?"
      ]
    },
    {
      title: "Clarity",
      chips: [
        "What is most likely true vs assumed?",
        "What\u2019s the simplest explanation that fits the facts?",
        "What detail would change this the most if I knew it?"
      ]
    },
    {
      title: "Repair",
      chips: [
        "What is a clean repair line here?",
        "What should I apologize for (if anything)?",
        "What should I not apologize for?"
      ]
    }
  ],
  pair: [
    {
      title: "From the other side",
      chips: [
        "How might they experience me in this moment?",
        "What might feel threatening to them, even if I didn\u2019t mean it?",
        "What might they be trying to protect right now?"
      ]
    },
    {
      title: "Better conversation",
      chips: [
        "Give me one sentence that is clear and not harsh",
        "What would calm this down fastest?",
        "What\u2019s one boundary that reduces conflict?"
      ]
    },
    {
      title: "Repair",
      chips: [
        "What is a clean repair line from my side?",
        "What is a clean repair line from their side?",
        "What should we agree on so this doesn\u2019t repeat?"
      ]
    }
  ],
  group: [
    {
      title: "Group pattern",
      chips: [
        "What roles are people falling into here?",
        "Who is carrying too much?",
        "What keeps getting avoided instead of addressed?"
      ]
    },
    {
      title: "Stabilize",
      chips: [
        "What would stabilize this group fastest?",
        "What is one simple rule that reduces conflict?",
        "What is one conversation that needs to happen directly?"
      ]
    }
  ]
};
function flatChips(mode) {
  return (CHIP_GROUPS[mode] ?? CHIP_GROUPS.self).flatMap((g) => g.chips);
}
__name(flatChips, "flatChips");

// src/safety.ts
var RISK_WORDS = [
  "kill myself",
  "want to die",
  "hurt myself",
  "suicide",
  "self harm",
  "abuse",
  "unsafe",
  "violence",
  "threat"
];
function safetyMode(text) {
  const t = (text || "").toLowerCase();
  for (const w of RISK_WORDS) {
    if (t.includes(w))
      return "support";
  }
  return "normal";
}
__name(safetyMode, "safetyMode");
function supportResponse() {
  return {
    type: "support",
    message: "This may involve real risk or distress. If you feel unsafe or overwhelmed, reaching out for support can help.",
    resources: [
      { label: "Call or text 988 (U.S.)", link: "https://988lifeline.org" },
      { label: "If you are in immediate danger, call local emergency services.", link: "https://www.usa.gov/emergency-help" }
    ],
    confidence: "Support mode"
  };
}
__name(supportResponse, "supportResponse");

// src/prompt.ts
var SYSTEM_RULES = `
Respond ONLY as valid JSON.

{
  "whatsGoingOn": "",
  "whyRepeating": "",
  "nextStep": "",
  "limits": "",
  "confidence": "High | Medium | Low | Not enough information"
}

Rules:
- Use simple, everyday language.
- Do not diagnose.
- Do not use therapy language.
- Do not label personality or identity.
- Do not predict outcomes.
- Max 2 sentences per field.
- If not enough detail is provided, set confidence to "Not enough information" and keep the answer short.
`;
function buildUserPrompt(input) {
  const people = input.people?.length ? input.people.join(", ") : "none";
  const baselineSection = input.baselineContext ? `Baseline (internal only):
${input.baselineContext}

` : "";
  return `
${baselineSection}Question:
${input.question}

What happened (user text):
${input.text || ""}

People selected:
${people}

Write a clear explanation using only the information given.
If baseline context is provided, use it for consistency but do not mention it in the answer.
`;
}
__name(buildUserPrompt, "buildUserPrompt");

// src/plan.ts
async function getSessionId(req) {
  const cookie = req.headers.get("Cookie") || "";
  const match = cookie.match(/sid=([a-zA-Z0-9_-]+)/);
  if (match)
    return match[1] ?? "";
  return crypto.randomUUID().replace(/-/g, "");
}
__name(getSessionId, "getSessionId");
async function getPlan(env, sid) {
  const v = await env.KV.get(`plan:${sid}`);
  return v === "pro" ? "pro" : "free";
}
__name(getPlan, "getPlan");
async function setPlan(env, sid, plan) {
  await env.KV.put(`plan:${sid}`, plan);
}
__name(setPlan, "setPlan");
function cookieHeader(sid) {
  return `sid=${sid}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`;
}
__name(cookieHeader, "cookieHeader");

// src/kv.ts
function todayKey() {
  const d = /* @__PURE__ */ new Date();
  return d.toISOString().slice(0, 10);
}
__name(todayKey, "todayKey");
async function useOne(env, sid) {
  const limit = Number(env.FREE_DAILY_LIMIT || "15");
  const key = `use:${sid}:${todayKey()}`;
  const current = Number(await env.KV.get(key) || "0");
  const next = current + 1;
  await env.KV.put(key, String(next), { expirationTtl: 60 * 60 * 36 });
  const remaining = Math.max(0, limit - next);
  return { ok: next <= limit, remaining };
}
__name(useOne, "useOne");

// src/baseline.ts
var BASELINE_KEY = /* @__PURE__ */ __name((sid) => `baseline:${sid}`, "BASELINE_KEY");
var USER_KEY = /* @__PURE__ */ __name((sid) => `user:${sid}`, "USER_KEY");
function isValidBaseline(data) {
  return typeof data === "object" && data !== null && typeof data.dob === "string" && data.dob.trim().length > 0 && typeof data.pob === "string" && data.pob.trim().length > 0 && typeof data.tob === "object" && data !== null && (data.tob.type === "exact" || data.tob.type === "approx") && typeof data.tob.value === "string" && data.tob.value.trim().length > 0;
}
__name(isValidBaseline, "isValidBaseline");
async function getBaseline(env, sid) {
  const raw = await env.KV.get(BASELINE_KEY(sid));
  if (!raw)
    return null;
  return safeJsonParse(raw);
}
__name(getBaseline, "getBaseline");
async function saveBaseline(env, sid, baseline) {
  const existing = await getBaseline(env, sid);
  const now = Date.now();
  const record = {
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
__name(saveBaseline, "saveBaseline");
async function handleGetBaseline(req, env) {
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
__name(handleGetBaseline, "handleGetBaseline");
async function handleSaveBaseline(req, env) {
  const sid = await getSessionId(req);
  const body = await req.json().catch(() => null);
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
__name(handleSaveBaseline, "handleSaveBaseline");

// src/explain.ts
function fallbackResult() {
  return {
    whatsGoingOn: "I may not have enough detail to explain this clearly yet.",
    whyRepeating: "A bit more context would help identify what is repeating.",
    nextStep: "Add what happened right before and right after.",
    limits: "If there is safety risk or ongoing disrespect, get support first.",
    confidence: "Low"
  };
}
__name(fallbackResult, "fallbackResult");
function audioScript(r) {
  return `${r.whatsGoingOn}

${r.whyRepeating}

One better next step:
${r.nextStep}

Confidence: ${r.confidence}`;
}
__name(audioScript, "audioScript");
function videoScenes(r) {
  return [
    { type: "messages", title: "What\u2019s going on", text: r.whatsGoingOn, seconds: 8 },
    { type: "pattern", title: "Why it repeats", text: r.whyRepeating, seconds: 10 },
    { type: "rewrite", title: "Try a calmer line", text: "Say it in one clear sentence without blame.", seconds: 7 },
    { type: "action", title: "One better next step", text: r.nextStep, seconds: 8 },
    { type: "confidence", title: "Confidence", text: r.confidence, seconds: 4 }
  ];
}
__name(videoScenes, "videoScenes");
function formatBaseline(baseline) {
  const tob = baseline.tob.type === "exact" ? baseline.tob.value : `approximate ${baseline.tob.value}`;
  return `DOB: ${baseline.dob}; TOB: ${tob}; POB: ${baseline.pob}`;
}
__name(formatBaseline, "formatBaseline");
async function handleExplain(req, env) {
  const sid = await getSessionId(req);
  const plan = await getPlan(env, sid);
  const freeLimit = Number(env.FREE_DAILY_LIMIT || "15");
  const remainingToday = plan === "free" ? freeLimit : 9999;
  const body = await req.json().catch(() => null);
  const input = body && typeof body.question === "string" ? {
    mode: body.mode || "self",
    question: body.question,
    text: body.text || "",
    people: body.people || []
  } : { mode: "self", question: "", text: "", people: [] };
  const baseline = await getBaseline(env, sid);
  if (!baseline) {
    return Response.json(
      {
        type: "needs_baseline",
        requestId: crypto.randomUUID(),
        mode: input.mode,
        plan,
        message: "Hidden baseline context is required. Visit Settings to add your DOB, TOB, and POB.",
        limits: { remainingToday }
      },
      {
        headers: {
          "set-cookie": cookieHeader(sid),
          "cache-control": "no-store"
        }
      }
    );
  }
  if (plan === "free") {
    const usage = await useOne(env, sid);
    if (!usage.ok) {
      return Response.json(
        {
          type: "ok",
          requestId: crypto.randomUUID(),
          mode: input.mode,
          result: {
            whatsGoingOn: "You\u2019ve hit today\u2019s free limit.",
            whyRepeating: "This keeps the free tier reliable for everyone.",
            nextStep: "Try again tomorrow or upgrade to Pro.",
            limits: "If you\u2019re in immediate risk, use support resources first.",
            confidence: "Not enough information"
          },
          chips: ["Upgrade to Pro", "Try again tomorrow"],
          audio: { title: "Overview", script: "Free limit reached.", format: "overview" },
          video: { format: "vertical", scenes: [] },
          confidence: "Not enough information",
          plan,
          limits: { remainingToday: usage.remaining }
        },
        { status: 429 }
      );
    }
  }
  if (safetyMode(input.text || "") === "support") {
    const resp = supportResponse();
    return Response.json(resp, {
      headers: {
        "set-cookie": cookieHeader(sid)
      }
    });
  }
  const requestId = crypto.randomUUID();
  const userPrompt = buildUserPrompt({
    mode: input.mode,
    question: input.question || "Explain this",
    text: input.text || "",
    people: input.people || [],
    baselineContext: formatBaseline(baseline)
  });
  const modelId = env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast";
  const ai = await env.AI.run(modelId, {
    messages: [
      { role: "system", content: SYSTEM_RULES },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.2,
    max_tokens: 350
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
    limits: { remainingToday }
  };
  return Response.json(response, {
    headers: {
      "set-cookie": cookieHeader(sid),
      "cache-control": "no-store"
    }
  });
}
__name(handleExplain, "handleExplain");

// src/chips.ts
async function handleChips(req, _env) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") || "self";
  const groups = CHIP_GROUPS[mode] ?? CHIP_GROUPS.self;
  const payload = {
    mode,
    groups
  };
  return Response.json(payload, {
    headers: { "cache-control": "public, max-age=300" }
  });
}
__name(handleChips, "handleChips");

// src/billing.ts
async function verifyStripeSignature(rawBody, sigHeader, secret) {
  const parts = sigHeader.split(",").reduce((acc, p) => {
    const [k, v] = p.split("=");
    if (k && v)
      acc[k.trim()] = v.trim();
    return acc;
  }, {});
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1)
    return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = `${t}.${rawBody}`;
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(signed));
  const hex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
  if (hex.length !== v1.length)
    return false;
  let out = 0;
  for (let i = 0; i < hex.length; i++)
    out |= hex.charCodeAt(i) ^ v1.charCodeAt(i);
  return out === 0;
}
__name(verifyStripeSignature, "verifyStripeSignature");
async function handleCheckout(req, env) {
  const sid = await getSessionId(req);
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID || !env.APP_URL) {
    return Response.json({ error: "billing_not_configured" }, { status: 500 });
  }
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("line_items[0][price]", env.STRIPE_PRICE_ID);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${env.APP_URL}/app?upgraded=1`);
  params.set("cancel_url", `${env.APP_URL}/app?canceled=1`);
  params.set("client_reference_id", sid);
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });
  const data = await res.json();
  if (!res.ok || !data?.url) {
    return Response.json({ error: "checkout_failed", details: data }, { status: 400 });
  }
  return Response.json(
    { url: data.url },
    { headers: { "set-cookie": cookieHeader(sid) } }
  );
}
__name(handleCheckout, "handleCheckout");
async function handleWebhook(req, env) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing webhook secret", { status: 500 });
  }
  const sig = req.headers.get("stripe-signature") || "";
  const raw = await req.text();
  const ok = await verifyStripeSignature(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  if (!ok)
    return new Response("Invalid signature", { status: 400 });
  const event = JSON.parse(raw);
  if (event?.type === "checkout.session.completed") {
    const session = event.data?.object;
    const sid = session?.client_reference_id;
    if (sid)
      await setPlan(env, sid, "pro");
  }
  if (event?.type === "customer.subscription.deleted") {
  }
  return Response.json({ received: true });
}
__name(handleWebhook, "handleWebhook");

// src/index.ts
var src_default = {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/health") {
      return Response.json({ status: "ok", service: "sovereign-api" });
    }
    if (url.pathname === "/api/explain" && req.method === "POST") {
      return handleExplain(req, env);
    }
    if (url.pathname === "/api/chips" && req.method === "GET") {
      return handleChips(req, env);
    }
    if (url.pathname === "/api/baseline" && req.method === "GET") {
      return handleGetBaseline(req, env);
    }
    if (url.pathname === "/api/baseline" && req.method === "POST") {
      return handleSaveBaseline(req, env);
    }
    if (url.pathname === "/api/billing/checkout" && req.method === "POST") {
      return handleCheckout(req, env);
    }
    if (url.pathname === "/api/billing/webhook" && req.method === "POST") {
      return handleWebhook(req, env);
    }
    return new Response("Not found", { status: 404 });
  }
};

// ../../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-PoB9kw/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-PoB9kw/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
