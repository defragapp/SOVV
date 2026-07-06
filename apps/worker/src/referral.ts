import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { getCorsHeaders } from "./cors.js";

// ── Referral system ───────────────────────────────────────────────────────────
// Referral codes stored in KV: referral-code:{userId} → code
// Referral tracking in D1: referrals table (created via migration)
// Reverse lookup: referral-user:{code} → userId

const CODE_KEY = (uid: string) => `referral-code:${uid}`;
const USER_KEY = (code: string) => `referral-user:${code}`;

function generateCode(userId: string): string {
  // Deterministic short code from userId + timestamp
  const hash = userId.replace(/-/g, "").slice(0, 8).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${hash}${suffix}`;
}

async function getOrCreateCode(env: Env, userId: string): Promise<string> {
  const existing = await env.KV.get(CODE_KEY(userId));
  if (existing) return existing;

  const code = generateCode(userId);
  await env.KV.put(CODE_KEY(userId), code, { expirationTtl: 60 * 60 * 24 * 3650 });
  await env.KV.put(USER_KEY(code), userId, { expirationTtl: 60 * 60 * 24 * 3650 });
  return code;
}

interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalInvited: number;
  totalConverted: number;
  totalPro: number;
  recentReferrals: Array<{
    email: string;
    joinedAt: string;
    tier: "free" | "pro";
  }>;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***";
  return `${local[0]}***@${domain}`;
}

export function registerReferralRoutes(router: any, getEnv: () => Env) {
  // GET /api/referral/stats — get referral stats for current user
  router.get("/api/referral/stats", async (request: Request) => {
    const env = getEnv();
    const cors = getCorsHeaders(request);

    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const code = await getOrCreateCode(env, user.id);
    const appUrl = env.APP_URL || "https://defrag.app";
    const referralLink = `${appUrl}?ref=${code}`;

    // Query D1 for referral stats
    let totalInvited = 0;
    let totalConverted = 0;
    let totalPro = 0;
    let recentReferrals: ReferralStats["recentReferrals"] = [];

    try {
      // Count users who signed up with this referral code
      const statsResult = await env.DB.prepare(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN tier != 'free' THEN 1 ELSE 0 END) as pro_count
         FROM users
         WHERE referral_code = ?`
      ).bind(code).first<{ total: number; pro_count: number }>();

      if (statsResult) {
        totalConverted = statsResult.total || 0;
        totalPro = statsResult.pro_count || 0;
        totalInvited = totalConverted; // Without click tracking, invited = converted
      }

      // Recent referrals (last 10)
      const recentResult = await env.DB.prepare(
        `SELECT email, created_at, tier
         FROM users
         WHERE referral_code = ?
         ORDER BY created_at DESC
         LIMIT 10`
      ).bind(code).all<{ email: string; created_at: string; tier: string }>();

      recentReferrals = (recentResult.results || []).map((r) => ({
        email: maskEmail(r.email),
        joinedAt: r.created_at,
        tier: (r.tier === "pro" ? "pro" : "free") as "free" | "pro",
      }));
    } catch {
      // Table may not exist yet — return empty stats gracefully
    }

    const stats: ReferralStats = {
      referralCode: code,
      referralLink,
      totalInvited,
      totalConverted,
      totalPro,
      recentReferrals,
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { "Content-Type": "application/json", ...cors },
    });
  });

  // GET /api/referral/code — get just the referral code (lightweight)
  router.get("/api/referral/code", async (request: Request) => {
    const env = getEnv();
    const cors = getCorsHeaders(request);

    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const code = await getOrCreateCode(env, user.id);
    const appUrl = env.APP_URL || "https://defrag.app";

    return new Response(JSON.stringify({ code, link: `${appUrl}?ref=${code}` }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...cors },
    });
  });
}