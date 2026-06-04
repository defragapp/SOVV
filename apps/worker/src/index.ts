import { Router } from "itty-router";
import type { Env } from "./types-env.js";
import { registerAuthRoutes } from "./auth.js";
import { registerBaselineRoutes } from "./baseline.js";
import { registerBillingRoutes } from "./billing.js";
import { registerChipsRoute } from "./chips.js";
import { registerExplainRoute } from "./explain-extended.js";
import { registerHistoryRoute } from "./history.js";
import { registerPatternsRoutes } from "./patterns.js";
import { extractPatterns } from "./patterns.js";
import { insertSupportTicket } from "./db.js";

const router = Router();
let currentEnv: Env;

const getEnv = () => currentEnv;

registerAuthRoutes(router, getEnv);
registerBaselineRoutes(router, getEnv);
registerBillingRoutes(router, getEnv);
registerChipsRoute(router, getEnv);
registerExplainRoute(router, getEnv);
registerHistoryRoute(router, getEnv);
registerPatternsRoutes(router, getEnv);
registerNatalRoutes(router, () => currentEnv);

// Health check for monitoring and deployment verification
router.get("/api/health", () => new Response(JSON.stringify({ status: "ok", timestamp: Date.now() }), { status: 200, headers: { "Content-Type": "application/json" } }));

async function sendSupportAutoReply(
  env: Env,
  ticket: { id: string; sender: string; subject: string }
): Promise<void> {
  if (!env.EMAIL) {
    // This is the free tier, no auto-reply capability.
    return;
  }

  try {
    const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#6366f1">Message received</h2>
      <p>Thanks for reaching out. Your message has been logged as <strong>\${ticket.id}</strong>.</p>
      <p>We'll get back to you as soon as possible.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
      <p style="color:#9ca3af;font-size:13px">Sovereign — defrag.app</p>
    </div>\`;
    const text = \`Thanks for reaching out. Your message has been logged as \${ticket.id}. We'll get back to you as soon as possible.\\n\\n— Sovereign (defrag.app)\`;

    await env.EMAIL.send({
      to: ticket.sender,
      from: { email: "noreply@defrag.app", name: "Sovereign" },
      subject: \`Re: \${ticket.subject} [\${ticket.id}]\`,
      text,
      html,
    });

    console.log(\`[EMAIL] Auto-reply sent to \${ticket.sender}\`);
  } catch (replyErr) {
    console.error("[EMAIL] Auto-reply failed:", replyErr);
  }
}

function registerNatalRoutes(router: any, getEnv: () => any) {
  router.get("/api/natal", async (request: Request) => {
    const env = getEnv();
    const user = await getAuthUser(request, env.DB);
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401);
    
    const raw = await env.KV.get(\`natal:\${user.id}\`);
    if (!raw) return jsonResponse({ natal: null }, 200);
    return jsonResponse({ natal: JSON.parse(raw) }, 200);
  });

  router.post("/api/natal", async (request: Request) => {
    const env = getEnv();
    const user = await getAuthUser(request, env.DB);
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return jsonResponse({ error: "Invalid body" }, 400);

    const required = ['name', 'birthDate', 'birthTime', 'birthLocation'];
    for (const field of required) {
      if (!body[field] || typeof body[field] !== 'string') {
        return jsonResponse({ error: \`Missing field: \${field}\`, 400);
      }
    }

    const record = { ...body, userId: user.id, updatedAt: Date.now() };
    await env.KV.put(\`natal:\${user.id}\`, JSON.stringify(record));
    return jsonResponse({ success: true, natal: record }, 200);
  });
}

router.all("*", () => new Response("Not Found", { status: 404 }));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    currentEnv = env;
    try {
      return await router.fetch(request, env, ctx);
    } catch (error) {
      console.error("Worker fetch error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
  async queue(
    batch: MessageBatch<unknown>,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    for (const message of batch.messages) {
      const body = message.body as { sessionId?: string; interactionId?: string };
      const sessionId = body?.sessionId;
      const interactionId = body?.interactionId;

      if (!sessionId || !interactionId) {
        console.error("Queue: invalid message body");
        message.ack(); // don't retry malformed messages
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

      // Prevent auto-reply loops
      const isAutomated =
        /noreply|no-reply|mailer-daemon|bounce|postmaster/i.test(sender) ||
        message.headers.get("Auto-Submitted")?.toLowerCase() !== "no" ||
        message.headers.get("X-Auto-Response-Suppress")?.toLowerCase() === "all" ||
        message.headers.get("Precedence")?.toLowerCase() === "bulk";

      if (isAutomated) {
        console.log(\`[EMAIL] Skipping automated message from \${sender}\`);
        return;
      }

      // Read body preview
      let bodyPreview = "";
      try {
        const raw = await new Response(message.raw as unknown as BodyInit).text();
        bodyPreview = raw.substring(0, 500);
      } catch {
        bodyPreview = "(unable to read body)";
      }

      // Create support ticket
      const ticketId = \`SV-\${Date.now().toString(36).toUpperCase()}\`;
      await insertSupportTicket(env.DB, {
        id: ticketId,
        sender,
        recipient,
        subject,
        body_preview: bodyPreview,
      });

      console.log(\`[EMAIL] Ticket created: \${ticketId} from \${sender}\`);

      // Send auto-reply ONLY if send_email binding is configured (paid tier)
      if (!isAutomated) {
        await sendSupportAutoReply(env, { id: ticketId, sender, subject });
      }

      // Forward original to owner Gmail (works on free tier)
      if (env.EMAIL_FORWARD_ADDRESS) {
        await message.forward(env.EMAIL_FORWARD_ADDRESS);
        console.log(\`[EMAIL] Forwarded to configured address.\`);
      } else {
        console.warn("[EMAIL] EMAIL_FORWARD_ADDRESS secret not set. Cannot forward email.");
      }

    } catch (err) {
      console.error("[EMAIL] Handler failed:", err);
      // Still try to forward even if ticket creation failed
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
