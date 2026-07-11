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
import { sendDay3NurtureEmail, sendDay7NurtureEmail } from "./email.js";
import { resolveEntitlements } from "./entitlements.js";
// New feature routes
import { registerReferralRoutes } from "./referral.js";
import { registerDefragMessageRoute } from "./defrag-message.js";
import { registerDefragMultiRoute } from "./defrag-multi.js";
import { registerInsightsRoute } from "./insights.js";
import { registerBaselineUpdateRoute } from "./baseline-update.js";
import { registerCovenantSearchRoute } from "./covenant-search.js";
import { registerAffiliateRoutes } from "./affiliate.js";
import { registerAdminCohortsRoute } from "./admin-cohorts.js";
import { registerAdminRevenueRoute } from "./admin-revenue.js";


const router = Router();
let currentEnv: Env;
const getEnv = () => currentEnv;

type WorkerRouteHandler = (request: Request, ...args: unknown[]) => Response | Promise<Response>;

interface WorkerRouteRegistrar {
  get(path: string, ...handlers: WorkerRouteHandler[]): unknown;
  post(path: string, ...handlers: WorkerRouteHandler[]): unknown;
  put(path: string, ...handlers: WorkerRouteHandler[]): unknown;
  delete(path: string, ...handlers: WorkerRouteHandler[]): unknown;
  options(path: string, ...handlers: WorkerRouteHandler[]): unknown;
  all(path: string, ...handlers: WorkerRouteHandler[]): unknown;
}

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
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

// === NATAL ROUTES ===
function registerNatalRoutes(router: WorkerRouteRegistrar, getEnv: () => Env) {
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
// New feature routes
registerReferralRoutes(router, getEnv);
registerDefragMessageRoute(router, getEnv);
registerDefragMultiRoute(router, getEnv);
registerInsightsRoute(router, getEnv);
registerBaselineUpdateRoute(router, getEnv);
registerCovenantSearchRoute(router, getEnv);
registerAffiliateRoutes(router, getEnv);
registerAdminCohortsRoute(router, getEnv);
registerAdminRevenueRoute(router, getEnv);


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
    console.error("[STRIPE_PRICES]", error);
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

// Detailed health check — checks all subsystems
router.get('/health/detailed', async (req: Request) => {
  const env = getEnv();
  const checks: Record<string, boolean | string> = {};
  const start = Date.now();

  // D1 database
  try {
    await env.DB.prepare('SELECT 1').first();
    checks.db = true;
  } catch (e) {
    checks.db = String(e);
  }

  // KV store
  try {
    await env.KV.put('health:ping', '1', { expirationTtl: 60 });
    const val = await env.KV.get('health:ping');
    checks.kv = val === '1';
  } catch (e) {
    checks.kv = String(e);
  }

  // AI binding
  checks.ai = Boolean((env as any).AI);

  // Stripe config
  checks.stripe = Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_ID);

  // Email config
  checks.email = Boolean(env.RESEND_API_KEY || (env as any).EMAIL);

  const allOk = Object.values(checks).every(v => v === true);
  const latency = Date.now() - start;

  return new Response(JSON.stringify({
    ok: allOk,
    service: 'sovereign-os-api',
    timestamp: new Date().toISOString(),
    latency_ms: latency,
    checks,
  }), {
    status: allOk ? 200 : 503,
    headers: { 'Content-Type': 'application/json' }
  });
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
    console.log(`[EMAIL] Auto-reply sent to ${ticket.sender}`);
  } catch (replyErr) {
    console.error("[EMAIL] Auto-reply failed:", replyErr);
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
  }), { status: 200, headers: { "Content-Type": "application/json", ...getCorsHeaders(request) } });
});

// GET /api/user/usage — session usage for current user (free tier counter)
router.get("/api/user/usage", async (request: Request) => {
  const env = getEnv();
  const user = await getAuthUser(request, env.DB);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401, headers: { "Content-Type": "application/json", ...getCorsHeaders(request) }
  });

  const FREE_LIMIT = parseInt(env.FREE_DAILY_LIMIT || "15", 10);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const usageKey = `usage:${user.id}:${today}`;
  const usedStr = await env.KV.get(usageKey);
  const used = usedStr ? parseInt(usedStr, 10) : 0;
  const isPro = resolveEntitlements(user).effectiveTier === "pro";

  return new Response(JSON.stringify({
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

  // Auth routes must never be cached
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/auth') || url.pathname.startsWith('/api/user') || url.pathname.startsWith('/api/billing')) {
    corsResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    corsResponse.headers.set('Pragma', 'no-cache');
  }
  
  const securityHeaders = {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
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
      console.error("[INTERNAL]", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  },

  async queue(batch: MessageBatch<unknown>, env: Env, _ctx: ExecutionContext): Promise<void> {
    await Promise.all(batch.messages.map(async (message) => {
      const body = message.body as { sessionId?: string; interactionId?: string };
      const sessionId = body?.sessionId;
      const interactionId = body?.interactionId;
      if (!sessionId || !interactionId) {
        console.error("Queue: invalid message body");
        message.ack();
        return;
      }
      try {
        await extractPatterns(env, sessionId, interactionId);
        message.ack();
      } catch (err) {
        console.error("Queue: pattern extraction failed for", interactionId, err);
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
        console.log(`[EMAIL] Skipping automated message from ${sender}`);
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
      console.log(`[EMAIL] Ticket created: ${ticketId} from ${sender}`);
      if (!isAutomated) {
        await sendSupportAutoReply(env, { id: ticketId, sender, subject });
      }
      if (env.EMAIL_FORWARD_ADDRESS) {
        await message.forward(env.EMAIL_FORWARD_ADDRESS);
        console.log(`[EMAIL] Forwarded to configured address.`);
      } else {
        console.warn("[EMAIL] EMAIL_FORWARD_ADDRESS secret not set. Cannot forward email.");
      }
    } catch (err) {
      console.error("[EMAIL] Handler failed:", err);
      if (env.EMAIL_FORWARD_ADDRESS) {
        try {
          await message.forward(env.EMAIL_FORWARD_ADDRESS);
        } catch (forwardErr) {
          console.error("[EMAIL] Forward failed:", forwardErr);
        }
      }
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    // Daily nurture email cron — runs at 10am UTC
    const emailOpts = {
      emailBinding: (env as any).EMAIL as any,
      resendApiKey: env.RESEND_API_KEY,
    };

    if (!emailOpts.emailBinding && !emailOpts.resendApiKey) return;

    const now = Date.now();
    const DAY = 86_400_000;

    // Find free users who registered 3 days ago (±12h window)
    const day3Min = now - 3 * DAY - 12 * 3_600_000;
    const day3Max = now - 3 * DAY + 12 * 3_600_000;
    const day3Users = await env.DB.prepare(
      "SELECT id, email FROM users WHERE tier = 'free' AND created_at >= ? AND created_at <= ?"
    ).bind(new Date(day3Min).toISOString(), new Date(day3Max).toISOString()).all<{ id: string; email: string }>();

    for (const user of (day3Users.results ?? [])) {
      // Check not already sent
      const sent = await env.KV.get(`nurture:day3:${user.id}`);
      if (sent) continue;
      await sendDay3NurtureEmail(user.email, emailOpts).catch(() => {});
      await env.KV.put(`nurture:day3:${user.id}`, "1", { expirationTtl: 60 * 60 * 24 * 30 });
    }

    // Find free users who registered 7 days ago (±12h window)
    const day7Min = now - 7 * DAY - 12 * 3_600_000;
    const day7Max = now - 7 * DAY + 12 * 3_600_000;
    const day7Users = await env.DB.prepare(
      "SELECT id, email FROM users WHERE tier = 'free' AND created_at >= ? AND created_at <= ?"
    ).bind(new Date(day7Min).toISOString(), new Date(day7Max).toISOString()).all<{ id: string; email: string }>();

    for (const user of (day7Users.results ?? [])) {
      const sent = await env.KV.get(`nurture:day7:${user.id}`);
      if (sent) continue;
      await sendDay7NurtureEmail(user.email, emailOpts).catch(() => {});
      await env.KV.put(`nurture:day7:${user.id}`, "1", { expirationTtl: 60 * 60 * 24 * 30 });
    }

    // Session cleanup — delete expired sessions from D1
    try {
      const result = await env.DB.prepare(
        "DELETE FROM sessions WHERE expires_at < ?"
      ).bind(Date.now()).run();
      if (result.meta?.changes && result.meta.changes > 0) {
        console.log(`[cron] Cleaned up ${result.meta.changes} expired sessions`);
      }
    } catch (err) {
      console.error("[cron] Session cleanup failed:", err);
    }

    // D1 backup — export user count snapshot to R2 (lightweight daily audit)
    try {
      if (env.TEMPLATES) {
        const now = new Date().toISOString().slice(0, 10);
        const [userSnap, sessionSnap, interactionSnap] = await Promise.all([
          env.DB.prepare("SELECT COUNT(*) as count, SUM(CASE WHEN tier='pro' THEN 1 ELSE 0 END) as pro FROM users").first(),
          env.DB.prepare("SELECT COUNT(*) as count FROM sessions WHERE expires_at > ?").bind(Date.now()).first(),
          env.DB.prepare("SELECT COUNT(*) as count FROM interactions WHERE created_at > ?").bind(Date.now() - 86400000).first(),
        ]);
        const snapshot = JSON.stringify({
          date: now,
          timestamp: new Date().toISOString(),
          users: userSnap,
          active_sessions: sessionSnap,
          interactions_24h: interactionSnap,
        });
        await env.TEMPLATES.put(`backups/daily/${now}.json`, snapshot, {
          httpMetadata: { contentType: "application/json" },
        });
        console.log(`[cron] Daily snapshot saved: backups/daily/${now}.json`);
      }
    } catch (err) {
      console.error("[cron] D1 backup failed:", err);
    }
  },
} satisfies ExportedHandler<Env>;
