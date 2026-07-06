import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { getCorsHeaders } from "./cors.js";

// ── Streak tracking ───────────────────────────────────────────────────────────
// Tracks consecutive days a user has used the platform.
// Stored in KV: streak:{userId} → { currentStreak, longestStreak, lastActiveDate }

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD UTC
  streakActive: boolean;
}

const STREAK_KEY = (uid: string) => `streak:${uid}`;

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUTC(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function getStreak(env: Env, userId: string): Promise<StreakData> {
  const raw = await env.KV.get(STREAK_KEY(userId));
  const today = todayUTC();

  if (!raw) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: "", streakActive: false };
  }

  const data = JSON.parse(raw) as StreakData;
  const streakActive = data.lastActiveDate === today;

  // If last active was before yesterday, streak is broken
  if (data.lastActiveDate !== today && data.lastActiveDate !== yesterdayUTC()) {
    return {
      currentStreak: 0,
      longestStreak: data.longestStreak,
      lastActiveDate: data.lastActiveDate,
      streakActive: false,
    };
  }

  return { ...data, streakActive };
}

export async function recordActivity(env: Env, userId: string): Promise<StreakData> {
  const today = todayUTC();
  const yesterday = yesterdayUTC();
  const existing = await getStreak(env, userId);

  let currentStreak = existing.currentStreak;

  if (existing.lastActiveDate === today) {
    // Already recorded today — no change
    return { ...existing, streakActive: true };
  } else if (existing.lastActiveDate === yesterday) {
    // Consecutive day — extend streak
    currentStreak += 1;
  } else {
    // Streak broken — restart
    currentStreak = 1;
  }

  const longestStreak = Math.max(currentStreak, existing.longestStreak);
  const updated: StreakData = {
    currentStreak,
    longestStreak,
    lastActiveDate: today,
    streakActive: true,
  };

  await env.KV.put(STREAK_KEY(userId), JSON.stringify(updated), {
    expirationTtl: 60 * 60 * 24 * 400, // 400 days
  });

  return updated;
}

export function registerStreakRoute(router: any, getEnv: () => Env) {
  router.get("/api/streak", async (request: Request) => {
    const env = getEnv();
    const cors = getCorsHeaders(request);

    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const streak = await getStreak(env, user.id);
    return new Response(JSON.stringify(streak), {
      status: 200,
      headers: { "Content-Type": "application/json", ...cors },
    });
  });
}