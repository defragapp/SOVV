import { Router } from "itty-router";
import type { Env } from "./types-env.js";
import { registerAuthRoutes, getAuthUser } from "./auth.js";
import { registerBaselineRoutes } from "./baseline.js";
import { registerBillingRoutes } from "./billing.js";
import { registerChipsRoute } from "./chips.js";
import { registerExplainRoute } from "./explain-extended.js";
import { registerHistoryRoute } from "./history.js";
import { registerPatternsRoutes } from "./patterns.js";
import { extractPatterns } from "./patterns.js";
import { registerCovenantRoute } from "./covenant.js";
import { insertSupportTicket } from "./db.js";

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

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://defrag.app';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
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
    
    const raw = await env.KV.get(`natal:${user.id}`);
    return new Response(JSON.stringify({ natal: raw ? JSON.parse(raw) : null }), {
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
      ...body,
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
registerBaselineRoutes(router, getEnv);
registerBillingRoutes(router, getEnv);
registerChipsRoute(router, getEnv);
registerExplainRoute(router, getEnv);
registerHistoryRoute(router, getEnv);
registerPatternsRoutes(router, getEnv);
registerNatalRoutes(router, () => currentEnv);
registerCovenantRoute(router, getEnv);

// Health check for monitoring and deployment verification
router.get('/health', () => {
  return new Response(JSON.stringify({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: { db: true, kv: true, ai: true }
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
    console.log(`[EMAIL] Auto-reply sent to ${ticket.sender}`);
  } catch (replyErr) {
    console.error("[EMAIL] Auto-reply failed:", replyErr);
  }
}

router.all("*", () => new Response("Not Found", { status: 404 }));

async function handleWithCors(request: Request, env: Env, ctx: ExecutionContext) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(request) });
  }
  
  // Apply Rate Limiting based on IP
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
  
  // Clone response and add CORS headers
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
      return new Response(JSON.stringify({ error: "Internal server error", details: e.message || String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  },

  async queue(batch: MessageBatch<unknown>, env: Env, _ctx: ExecutionContext): Promise<void> {
    for (const message of batch.messages) {
      const body = message.body as { sessionId?: string; interactionId?: string };
      const sessionId = body?.sessionId;
      const interactionId = body?.interactionId;
      if (!sessionId || !interactionId) {
        console.error("Queue: invalid message body");
        message.ack();
        continue;
      }
      try {
        await extractPatterns(env, sessionId, interactionId);
        message.ack();
      } catch (err) {
        console.error("Queue: pattern extraction failed for", interactionId, err);
        message.retry();
      }
    }
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
      const ticketId = `SV-${Date.now().toString(36).toUpperCase()}`;
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
} satisfies ExportedHandler<Env>;
