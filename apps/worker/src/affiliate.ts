import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { getCorsHeaders } from "./cors.js";
import { sanitizeInput } from "./utils/sanitize.js";

// ── Affiliate / partner link system ──────────────────────────────────────────
// Partners get a unique code. Conversions are tracked in D1.
// Codes stored in KV: affiliate-code:{userId} → code
// Reverse: affiliate-user:{code} → userId

const AFF_CODE_KEY = (uid: string) => `affiliate-code:${uid}`;
const AFF_USER_KEY = (code: string) => `affiliate-user:${code}`;
const AFF_CLICK_KEY = (code: string) => `affiliate-clicks:${code}`;

function generateAffiliateCode(userId: string): string {
  const base = userId.replace(/-/g, "").slice(0, 6).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AFF-${base}-${rand}`;
}

async function getOrCreateAffiliateCode(env: Env, userId: string): Promise<string> {
  const existing = await env.KV.get(AFF_CODE_KEY(userId));
  if (existing) return existing;

  const code = generateAffiliateCode(userId);
  await env.KV.put(AFF_CODE_KEY(userId), code, { expirationTtl: 60 * 60 * 24 * 3650 });
  await env.KV.put(AFF_USER_KEY(code), userId, { expirationTtl: 60 * 60 * 24 * 3650 });
  return code;
}

interface AffiliateStats {
  code: string;
  link: string;
  clicks: number;
  conversions: number;
  proConversions: number;
  commissionRate: number; // percentage
  status: "active" | "pending" | "suspended";
}

export function registerAffiliateRoutes(router: any, getEnv: () => Env) {
  // GET /api/affiliate — get current user's affiliate info
  router.get("/api/affiliate", async (request: Request) => {
    const env = getEnv();
    const cors = getCorsHeaders(request);

    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const code = await env.KV.get(AFF_CODE_KEY(user.id));
    if (!code) {
      return new Response(JSON.stringify({ registered: false }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const appUrl = env.APP_URL || "https://defrag.app";
    const clicksRaw = await env.KV.get(AFF_CLICK_KEY(code));
    const clicks = clicksRaw ? parseInt(clicksRaw, 10) : 0;

    // Query conversions from D1
    let conversions = 0;
    let proConversions = 0;
    try {
      const result = await env.DB.prepare(
        `SELECT COUNT(*) as total, SUM(CASE WHEN tier != 'free' THEN 1 ELSE 0 END) as pro_count
         FROM users WHERE affiliate_code = ?`
      ).bind(code).first<{ total: number; pro_count: number }>();
      if (result) {
        conversions = result.total || 0;
        proConversions = result.pro_count || 0;
      }
    } catch {
      // Table column may not exist yet
    }

    const stats: AffiliateStats = {
      code,
      link: `${appUrl}?aff=${code}`,
      clicks,
      conversions,
      proConversions,
      commissionRate: 20, // 20% commission — configurable
      status: "active",
    };

    return new Response(JSON.stringify({ registered: true, ...stats }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...cors },
    });
  });

  // POST /api/affiliate — register as affiliate partner
  router.post("/api/affiliate", async (request: Request) => {
    const env = getEnv();
    const cors = getCorsHeaders(request);

    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    // Check if already registered
    const existing = await env.KV.get(AFF_CODE_KEY(user.id));
    if (existing) {
      const appUrl = env.APP_URL || "https://defrag.app";
      return new Response(JSON.stringify({
        success: true,
        code: existing,
        link: `${appUrl}?aff=${existing}`,
        message: "Already registered as affiliate partner.",
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const code = await getOrCreateAffiliateCode(env, user.id);
    const appUrl = env.APP_URL || "https://defrag.app";

    return new Response(JSON.stringify({
      success: true,
      code,
      link: `${appUrl}?aff=${code}`,
      message: "Affiliate account created. Share your link to earn commissions.",
      commissionRate: 20,
    }), {
      status: 201,
      headers: { "Content-Type": "application/json", ...cors },
    });
  });

  // GET /api/affiliate/:code — validate an affiliate code (public)
  router.get("/api/affiliate/:code", async (request: Request) => {
    const env = getEnv();
    const cors = getCorsHeaders(request);

    const url = new URL(request.url);
    const code = url.pathname.split("/").pop() || "";

    if (!code || code.length < 3) {
      return new Response(JSON.stringify({ error: "Invalid code" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const userId = await env.KV.get(AFF_USER_KEY(code));
    if (!userId) {
      return new Response(JSON.stringify({ valid: false }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    // Record click
    const clicksRaw = await env.KV.get(AFF_CLICK_KEY(code));
    const clicks = (clicksRaw ? parseInt(clicksRaw, 10) : 0) + 1;
    await env.KV.put(AFF_CLICK_KEY(code), String(clicks), { expirationTtl: 60 * 60 * 24 * 3650 });

    return new Response(JSON.stringify({ valid: true, code }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...cors },
    });
  });
}