import { logSafetyEvent } from "./safety.js";
import { Router } from "itty-router";
import type { Env } from "./types-env.js";
import { registerAuthRoutes, getAuthUser, registerAdminSeedRoute } from "./auth.js";
import { registerBaselineRoutes } from "./baseline.js";
import { registerBillingRoutes } from "./billing.js";
import { registerChipsRoute } from "./chips.js";
import { registerExplainRoute } from "./explain-extended.js";
import { registerExplainStreamRoute } from "./routes/explain-stream.js";
import { registerHistoryRoute } from "./history.js";
import { registerPatternsRoutes, extractPatterns } from "./patterns.js";
import { registerCovenantRoute } from "./covenant.js";
import { registerAlignmentRoute } from "./alignment.js";
import { registerAudioRoute } from "./audio.js";
import { insertSupportTicket } from "./db.js";
import { registerDeriveProfileRoutes } from "./derive-profile.js";
import { registerInviteRoutes } from "./invite.js";
import { registerAuthExtendedRoutes } from "./routes/auth-extended.js";
import { registerInviteSystemRoutes } from "./routes/invite.js";

const router = Router();
let currentEnv: Env;
const getEnv = () => currentEnv;

// === CORS CONFIGURATION ===
const ALLOWED_ORIGINS = [
  'https://defrag.app',
  'https://www.defrag.app',
  'https://app.defrag.app',
  'https://sovereign.defrag.app',
  'https://premium.defrag.app',
];

export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };

  if (ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

// === NATAL ROUTES ===
function registerNatalRoutes(router: any, getEnv: () => Env) {
  // GET /api/natal - fetch existing natal data
  router.get("/api/natal", async (request: Request) => {
    const env = getEnv();
    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) },
      });
    }
    
    const record = await env.KV.get(`natal:${user.id}`);
    if (record) {
      return new Response(JSON.stringify({ success: true, natal: JSON.parse(record) }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) },
      });
    }
    return new Response(JSON.stringify({ success: true, natal: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) },
    });
  });

  // POST /api/natal - save natal data
  router.post("/api/natal", async (request: Request) => {
    const env = getEnv();
    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) },
      });
    }

    const body = await request.json().catch(() => null) as Record<string, any> | null;
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: "Invalid body" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) },
      });
    }

    const required = ['name', 'birthDate', 'birthTime', 'birthLocation'];
    for (const field of required) {
      if (!body[field] || typeof body[field] !== 'string') {
        return new Response(JSON.stringify({ error: `Missing field: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) },
        });
      }
    }

    const record = {
      name: body.name,
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      birthLocation: body.birthLocation,
      userId: user.id,
      updatedAt: Date.now(),
    };

    await env.KV.put(`natal:${user.id}`, JSON.stringify(record));
    
    return new Response(JSON.stringify({ success: true, natal: record }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) },
    });
  });
}

registerAuthRoutes(router, getEnv);
registerAuthExtendedRoutes(router, getEnv);
registerAdminSeedRoute(router, getEnv);
registerInviteSystemRoutes(router, getEnv);
registerBaselineRoutes(router, getEnv);
registerBillingRoutes(router, getEnv);
registerChipsRoute(router, getEnv);
registerExplainRoute(router, getEnv);
registerExplainStreamRoute(router, getEnv);
registerHistoryRoute(router, getEnv);
registerPatternsRoutes(router, getEnv);
registerNatalRoutes(router, () => currentEnv);
registerCovenantRoute(router, getEnv);
registerAlignmentRoute(router, getEnv);
registerAudioRoute(router, getEnv);
registerDeriveProfileRoutes(router, getEnv);
registerInviteRoutes(router, getEnv);

// Memory context endpoint — pattern history for UI
router.get("/api/memory", async (request: Request) => {
  const env = getEnv();
  const user = await getAuthUser(request, env.DB);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...getCorsHeaders(request) } });
  
  const { loadMemoryContext } = await import("./memory.js");
  const context = await loadMemoryContext(env, user.id);
  
  return new Response(JSON.stringify({
    sessionCount: context.sessionCount,
    recurringPattern: context.recurringPattern || null,
    recentPatterns: context.recentPatterns.slice(0, 3).map(p => ({
      pattern: p.pattern,
      space: p.space,
      sessionCount: p.sessionCount,
    })),
  }), { status: 200, headers: { "Content-Type": "application/json", ...getCorsHeaders(request) } });
});

router.get("/api/stripe/prices", async (request: Request) => {
  const env = getEnv();
  if (!env.STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json", ...getCorsHeaders(request) },
    });
  }

  try {
    const response = await fetch("https://api.stripe.com/v1/prices?active=true&expand[]=data.product", {
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      },
    });

    const payload = await response.json() as { data?: Array<Record<string, any>> };
    const prices = Array.isArray(payload.data)
      ? payload.data.map((price) => ({
          id: price.id,
          active: price.active,
          currency: price.currency,
          unit_amount: price.unit_amount,
          interval: price.recurring?.interval ?? null,
          interval_count: price.recurring?.interval_count ?? null,
          nickname: price.nickname ?? null,
          lookup_key: price.lookup_key ?? null,
          product: typeof price.product === "object" && price.product !== null
            ? {
                id: price.product.id ?? null,
                name: price.product.name ?? null,
              }
            : price.product ?? null,
        }))
      : [];

    return new Response(JSON.stringify(prices), {
      status: 200,
      headers: { "Content-Type": "application/json", ...getCorsHeaders(request) },
    });
  } catch (error) {
    logSafetyEvent({ level: "error", event: "stripe_prices_fetch_failed", error_type: "system", error });
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json", ...getCorsHeaders(request) },
    });
  }
});

// Root route — deployment validation
router.get('/', () => {
  return new Response(JSON.stringify({
    service: 'sovereign-os-api',
    status: 'ok',
  }), { headers: { 'Content-Type': 'application/json' } });
});

// Health check
router.get('/health', () => {
  return new Response(JSON.stringify({
    ok: true,
    service: 'sovereign-os-api',
    timestamp: new Date().toISOString(),
  }), { headers: { 'Content-Type': 'application/json' } });
});

async function sendSupportAutoReply(env: Env, ticket: { id: string; sender: string; subject: string } ): Promise<void> {
  if (!env.EMAIL) {
    return;
  }
  try {
    const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#6366f1">Message received</h2>
      <p>Thanks for reaching out. Your message has been logged as <strong>${ticket.id}</strong>.</p>
      <p>We'll get back to you as soon as possible.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
      <p style="color:#9ca3af;font-size:13px">Sovereign — defrag.app</p>
    </div>`;
    const text = `Thanks for reaching out. Your message has been logged as ${ticket.id}. We'll get back to you as soon as possible.\n\n— Sovereign (defrag.app)`;
    await env.EMAIL.send({
      to: ticket.sender,
      from: { email: "noreply@defrag.app", name: "Sovereign" },
      subject: `Re: ${ticket.subject} [${ticket.id}]`,
      text,
      html,
    });
    logSafetyEvent({ level: "info", event: "email_auto_reply_sent", details: { recipient: ticket.sender } });
  } catch (replyErr) {
    logSafetyEvent({ level: "warn", event: "email_auto_reply_failed", error_type: "system", error: replyErr });
  }
}

// GET /api/user/me — current authenticated user info
router.get("/api/user/me", async (request: Request) => {
  const env = getEnv();
  const user = await getAuthUser(request, env.DB);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401, headers: { "Content-Type": "application/json", ...getCorsHeaders(request) }
  });
  return new Response(JSON.stringify({
    id: user.id,
    email: user.email,
    tier: user.tier || "free",
    subscription_status: user.subscription_status || "free",
    email_verified: user.email_verified === 1,
    subscription_current_period_end: user.subscription_current_period_end ?? null,
  }), { status: 200, headers: { "Content-Type": "application/json", ...getCorsHeaders(request) } });
});

// GET /api/user/usage — session usage for current user (free tier counter)
router.get("/api/user/usage", async (request: Request) => {
  const env = getEnv();
  const user = await getAuthUser(request, env.DB);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401, headers: { "Content-Type": "application/json", ...getCorsHeaders(request) }
  });

  const { resolveEntitlements } = await import("./entitlements.js");
  const entitlements = resolveEntitlements(user);
  const isPro = entitlements.effectiveTier === "pro";
  const FREE_LIMIT = parseInt(env.FREE_DAILY_LIMIT || "15", 10);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const usageKey = `usage:${user.id}:${today}`;
  const usedStr = await env.KV.get(usageKey);
  const used = usedStr ? parseInt(usedStr, 10) : 0;

  return new Response(JSON.stringify({
    tier: entitlements.effectiveTier,
    used,
    limit: isPro ? null : FREE_LIMIT,
    remaining: isPro ? null : Math.max(0, FREE_LIMIT - used),
    isPro,
    resetAt: today + "T00:00:00Z",
  }), { status: 200, headers: { "Content-Type": "application/json", ...getCorsHeaders(request) } });
});

router.all("*", () => new Response("Not Found", { status: 404 }));

async function handleWithCors(request: Request, env: Env, ctx: ExecutionContext) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(request) });
  }
  
  if (env.RATE_LIMITER) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown-ip';
    const { success } = await env.RATE_LIMITER.limit({ key: ip });
    if (!success) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }
  }
  
  const response = await router.fetch(request, env, ctx);
  
  const corsResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
  
  const cors = getCorsHeaders(request);
  Object.entries(cors).forEach(([key, value]) => {
    corsResponse.headers.set(key, value);
  });
  
  const securityHeaders = {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    // CSP: restrict script/style sources, allow Cloudflare Turnstile and Stripe
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.defrag.app https://api.stripe.com",
      "frame-src https://challenges.cloudflare.com https://js.stripe.com",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; '),
  };
  Object.entries(securityHeaders).forEach(([key, value]) => {
    corsResponse.headers.set(key, value);
  });
  
  return corsResponse;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    currentEnv = env;
    try {
      return await handleWithCors(request, env, ctx);
    } catch (error) {
      logSafetyEvent({ level: "error", event: "internal_error", error_type: "system", error });
      return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  },

  async queue(batch: MessageBatch<unknown>, env: Env, _ctx: ExecutionContext): Promise<void> {
    await Promise.all(batch.messages.map(async (message) => {
      const body = message.body as { sessionId?: string; interactionId?: string };
      const sessionId = body?.sessionId;
      const interactionId = body?.interactionId;
      if (!sessionId || !interactionId) {
        logSafetyEvent({ level: "warn", event: "queue_invalid_message_body", error_type: "validation" });
        message.ack();
        return;
      }
      try {
        await extractPatterns(env, sessionId, interactionId);
        message.ack();
      } catch (err) {
        logSafetyEvent({ level: "error", event: "queue_pattern_extraction_failed", error_type: "system", error: err, details: { interactionId } });
        message.retry();
      }
    }));
  },

  async email(message: any, env: Env, _ctx: ExecutionContext): Promise<void> {
    try {
      const sender = message.from;
      const recipient = message.to;
      const subject = message.headers.get("subject") || "(no subject)";
      const isAutomated = /noreply|no-reply|mailer-daemon|bounce|postmaster/i.test(sender) || 
                          message.headers.get("Auto-Submitted")?.toLowerCase() !== "no" || 
                          message.headers.get("X-Auto-Response-Suppress")?.toLowerCase() === "all" || 
                          message.headers.get("Precedence")?.toLowerCase() === "bulk";
      if (isAutomated) {
        logSafetyEvent({ level: "info", event: "email_automated_skipped", details: { sender } });
        return;
      }
      let bodyPreview = "";
      try {
        const raw = await new Response(message.raw as unknown as BodyInit).text();
        bodyPreview = raw.substring(0, 500);
      } catch {
        bodyPreview = "(unable to read body)";
      }
      const ticketId = `SV-${crypto.randomUUID()}`;
      await insertSupportTicket(env.DB, {
        id: ticketId,
        sender,
        recipient,
        subject,
        body_preview: bodyPreview,
      });
      logSafetyEvent({ level: "info", event: "email_ticket_created", details: { ticketId, sender } });
      if (!isAutomated) {
        await sendSupportAutoReply(env, { id: ticketId, sender, subject });
      }
      if (env.EMAIL_FORWARD_ADDRESS) {
        await message.forward(env.EMAIL_FORWARD_ADDRESS);
        logSafetyEvent({ level: "info", event: "email_forwarded" });
      } else {
        logSafetyEvent({ level: "warn", event: "email_forward_address_missing", error_type: "system" });
      }
    } catch (err) {
      logSafetyEvent({ level: "error", event: "email_handler_failed", error_type: "system", error: err });
      if (env.EMAIL_FORWARD_ADDRESS) {
        try {
          await message.forward(env.EMAIL_FORWARD_ADDRESS);
        } catch (forwardErr) {
          logSafetyEvent({ level: "error", event: "email_forward_failed", error_type: "system", error: forwardErr });
        }
      }
    }
  },
} satisfies ExportedHandler<Env>;
