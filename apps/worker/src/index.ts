import { Router } from "itty-router";
import type { Env } from "./types-env.js";
import { registerAuthRoutes, getAuthUser } from "./auth.js";
import { registerBaselineRoutes } from "./baseline.js";
import { registerBillingRoutes } from "./billing.js";
import { registerChipsRoute } from "./chips.js";
import { registerExplainRoute } from "./explain-extended.js";
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
import {
  ensureRequiredEnv,
  fetchWithTimeout,
  logSystemError,
  withLimitedRetry,
} from "./runtime-resilience.js";

const router = Router();
let currentEnv: Env;
const getEnv = () => currentEnv;
let envValidated = false;
const MAX_REQUEST_BYTES = 256 * 1024;
const MAX_RESPONSE_BYTES = 512 * 1024;

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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-request-id, x-endpoint',
    'Access-Control-Expose-Headers': 'x-request-id, x-endpoint',
    'Vary': 'Origin',
  };

  if (ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

function validateRuntimeEnv(env: Env): void {
  if (envValidated) {
    return;
  }
  ensureRequiredEnv(env as unknown as Record<string, unknown>, [
    "DB",
    "KV",
    "AI",
    "AI_SERVICE",
    "SESSION_SERVICE",
    "FREE_DAILY_LIMIT",
    "APP_URL",
  ]);
  envValidated = true;
}

async function enforceRequestSize(request: Request): Promise<Response | null> {
  if (!["POST", "PUT", "PATCH"].includes(request.method)) {
    return null;
  }
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (!Number.isNaN(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return new Response(JSON.stringify({ error: "payload_too_large" }), {
        status: 413,
        headers: { "Content-Type": "application/json", ...getCorsHeaders(request) },
      });
    }
  }

  const requestBody = request.clone().body;
  if (requestBody) {
    const reader = requestBody.getReader();
    let bytesRead = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytesRead += value.byteLength;
        if (bytesRead > MAX_REQUEST_BYTES) {
          await reader.cancel();
          return new Response(JSON.stringify({ error: "payload_too_large" }), {
            status: 413,
            headers: { "Content-Type": "application/json", ...getCorsHeaders(request) },
          });
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  return null;
}

async function enforceResponseSize(response: Response, request: Request): Promise<Response> {
  if (response.status === 101 || response.body === null) {
    return response;
  }
  const bytes = (await response.clone().arrayBuffer()).byteLength;
  if (bytes <= MAX_RESPONSE_BYTES) {
    return response;
  }
  logSystemError("response_too_large", { bytes, maxBytes: MAX_RESPONSE_BYTES });
  return new Response(JSON.stringify({ error: "response_too_large" }), {
    status: 502,
    headers: { "Content-Type": "application/json", ...getCorsHeaders(request) },
  });
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

    const body = await request.json().catch((error) => {
      logSafetyEvent({
        level: "warn",
        event: "natal_save_invalid_json",
        request,
        error_type: "validation",
        error,
      });
      return null;
    }) as Record<string, any> | null;
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
registerInviteSystemRoutes(router, getEnv);
registerBaselineRoutes(router, getEnv);
registerBillingRoutes(router, getEnv);
registerChipsRoute(router, getEnv);
registerExplainRoute(router, getEnv);
registerHistoryRoute(router, getEnv);
registerPatternsRoutes(router, getEnv);
registerNatalRoutes(router, () => currentEnv);
registerCovenantRoute(router, getEnv);
registerAlignmentRoute(router, getEnv);
registerAudioRoute(router, getEnv);
registerDeriveProfileRoutes(router, getEnv);
registerInviteRoutes(router, getEnv);

// User info endpoints
router.get("/api/user/me", async (request: Request) => {
  const env = getEnv();
  const user = await getAuthUser(request, env.DB);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...getCorsHeaders(request) } });
  // Check email verification status
  const emailVerified = await env.DB.prepare(
    "SELECT verified_at FROM email_verification_tokens WHERE user_id = ? AND verified_at IS NOT NULL LIMIT 1"
  ).bind(user.id).first().catch(() => null)

  return new Response(JSON.stringify({
    id: user.id,
    email: user.email,
    tier: user.tier,
    role: user.role,
    stripeCustomerId: (user as any).stripe_customer_id || null,
    subscriptionStatus: (user as any).subscription_status || null,
    emailVerified: Boolean(emailVerified),
  }), { status: 200, headers: { "Content-Type": "application/json", ...getCorsHeaders(request) } });
});

router.get("/api/user/usage", async (request: Request) => {
  const env = getEnv();
  const user = await getAuthUser(request, env.DB);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...getCorsHeaders(request) } });
  
  const FREE_LIMIT = parseInt(env.FREE_DAILY_LIMIT || "15", 10);
  const today = new Date().toISOString().slice(0, 10);
  const usageKey = `usage:${user.id}:${today}`;
  const usedStr = await env.KV.get(usageKey);
  const used = usedStr ? parseInt(usedStr, 10) : 0;
  const isPro = user.tier === "pro" || (user as any).subscription_status === "active";
  
  return new Response(JSON.stringify({
    tier: isPro ? "pro" : "free",
    used,
    limit: isPro ? -1 : FREE_LIMIT,
    remaining: isPro ? -1 : Math.max(0, FREE_LIMIT - used),
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
    const response = await withLimitedRetry(
      "stripe_prices_fetch",
      () =>
        fetchWithTimeout(
          "https://api.stripe.com/v1/prices?active=true&expand[]=data.product",
          {
            headers: {
              Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
            },
          },
          8_000
        ),
      2,
      8_000
    );

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
    logSafetyEvent({
      level: "error",
      event: "stripe_prices_fetch_failed",
      request,
      error_type: "billing",
      error,
    });
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
router.get('/health', (request: Request) => {
  return new Response(JSON.stringify({
    ok: true,
    service: 'sovereign-os-api',
    timestamp: new Date().toISOString(),
    version: currentEnv.CF_VERSION_METADATA,
  }), { headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) } });
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
    logSafetyEvent({
      event: "email_auto_reply_sent",
      endpoint: "email:auto-reply",
      requestId: ticket.id,
      details: { recipient: ticket.sender },
    });
  } catch (replyErr) {
    logSafetyEvent({
      level: "error",
      event: "email_auto_reply_failed",
      endpoint: "email:auto-reply",
      requestId: ticket.id,
      error_type: "system",
      error: replyErr,
      details: { recipient: ticket.sender },
    });
  }
}

router.all("*", () => new Response("Not Found", { status: 404 }));

async function handleWithCors(request: Request, env: Env, ctx: ExecutionContext) {
  const oversizedRequest = await enforceRequestSize(request);
  if (oversizedRequest) {
    return oversizedRequest;
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(request) });
  }
  
  if (env.RATE_LIMITER) {
    const ip = tracedRequest.headers.get('cf-connecting-ip') || 'unknown-ip';
    const { success } = await env.RATE_LIMITER.limit({ key: ip });
    if (!success) {
      return finalizeResponse(tracedRequest, new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      }), diagnostic.startedAt, env, ctx);
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
    'Content-Security-Policy': "default-src 'none'; connect-src 'self' https://api.stripe.com https://challenges.cloudflare.com; frame-src https://js.stripe.com https://challenges.cloudflare.com; script-src 'self' https://js.stripe.com https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; object-src 'none'; base-uri 'self'",
  };
  Object.entries(securityHeaders).forEach(([key, value]) => {
    corsResponse.headers.set(key, value);
  });
  
  return enforceResponseSize(corsResponse, request);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    validateRuntimeEnv(env);
    currentEnv = env;
    try {
      return await handleWithCors(request, env, ctx);
    } catch (error) {
      const diagnostic = createDiagnosticRequest(request);
      logSafetyEvent({
        level: "error",
        event: "request_crashed",
        request: diagnostic.request,
        error_type: "system",
        error,
      });
      return finalizeResponse(
        diagnostic.request,
        new Response(JSON.stringify({ error: "Internal server error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }),
        diagnostic.startedAt,
        env,
        ctx,
      );
    }
  },

  async queue(batch: MessageBatch<unknown>, env: Env, _ctx: ExecutionContext): Promise<void> {
    await Promise.all(batch.messages.map(async (message) => {
      const body = message.body as { sessionId?: string; interactionId?: string };
      const sessionId = body?.sessionId;
      const interactionId = body?.interactionId;
      if (!sessionId || !interactionId) {
        logSafetyEvent({
          level: "error",
          event: "queue_invalid_message",
          endpoint: "queue:patterns",
          requestId: interactionId ?? "missing",
          error_type: "system",
          details: { sessionId: sessionId ?? null },
        });
        message.ack();
        return;
      }
      try {
        await extractPatterns(env, sessionId, interactionId);
        message.ack();
      } catch (err) {
        logSafetyEvent({
          level: "error",
          event: "queue_pattern_extraction_failed",
          endpoint: "queue:patterns",
          requestId: interactionId,
          error_type: "system",
          error: err,
          details: { sessionId },
        });
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
        logSafetyEvent({
          event: "email_skipped_automated_sender",
          endpoint: "email:inbound",
          requestId: sender,
          details: { sender },
        });
        return;
      }
      let bodyPreview = "";
      try {
        const raw = await new Response(message.raw as unknown as BodyInit).text();
        bodyPreview = raw.substring(0, 500);
      } catch (error) {
        logSafetyEvent({
          level: "warn",
          event: "email_body_preview_failed",
          endpoint: "email:inbound",
          requestId: sender,
          error_type: "system",
          error,
          details: { sender },
        });
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
      logSafetyEvent({
        event: "email_ticket_created",
        endpoint: "email:inbound",
        requestId: ticketId,
        details: { sender },
      });
      if (!isAutomated) {
        await sendSupportAutoReply(env, { id: ticketId, sender, subject });
      }
      if (env.EMAIL_FORWARD_ADDRESS) {
        await message.forward(env.EMAIL_FORWARD_ADDRESS);
        logSafetyEvent({
          event: "email_forwarded",
          endpoint: "email:inbound",
          requestId: ticketId,
          details: { sender },
        });
      } else {
        logSafetyEvent({
          level: "warn",
          event: "email_forward_address_missing",
          endpoint: "email:inbound",
          requestId: ticketId,
          error_type: "system",
          details: { sender },
        });
      }
    } catch (err) {
      logSafetyEvent({
        level: "error",
        event: "email_handler_failed",
        endpoint: "email:inbound",
        requestId: message.from ?? "unknown",
        error_type: "system",
        error: err,
      });
      if (env.EMAIL_FORWARD_ADDRESS) {
        try {
          await message.forward(env.EMAIL_FORWARD_ADDRESS);
        } catch (forwardErr) {
          logSafetyEvent({
            level: "error",
            event: "email_forward_failed",
            endpoint: "email:inbound",
            requestId: message.from ?? "unknown",
            error_type: "system",
            error: forwardErr,
          });
        }
      }
    }
  },
} satisfies ExportedHandler<Env>;
