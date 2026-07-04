import { db, usageEvents } from "@workspace/db";
import { and, eq, gte, sql } from "drizzle-orm";

/** Free-tier daily session cap (advertised on the pricing page). */
export const FREE_DAILY_LIMIT = 15;

/** Midnight (UTC) of the given day — the reset boundary for daily limits. */
export function startOfUtcDay(d: Date = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Count how many metered sessions a user has consumed since midnight UTC. */
export async function countTodayUsage(userId: string): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(usageEvents)
    .where(and(eq(usageEvents.userId, userId), gte(usageEvents.createdAt, startOfUtcDay())));
  return row?.n ?? 0;
}

/** Record a single metered session event. */
export async function recordUsage(userId: string, kind = "defrag"): Promise<void> {
  await db.insert(usageEvents).values({ userId, kind });
}

/**
 * Atomically reserve a daily session slot. Uses a per-user transaction advisory
 * lock so concurrent requests serialize and cannot collectively exceed `limit`.
 * Returns the new event id on success, or null when the cap is already reached.
 * Callers should `refundUsage(id)` if the downstream work fails, so users are
 * never charged for errors (including provider quota failures).
 */
export async function reserveUsage(userId: string, limit: number, kind = "defrag"): Promise<string | null> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${userId}))`);
    const [row] = await tx
      .select({ n: sql<number>`count(*)::int` })
      .from(usageEvents)
      .where(and(eq(usageEvents.userId, userId), gte(usageEvents.createdAt, startOfUtcDay())));
    if ((row?.n ?? 0) >= limit) return null;
    const [ins] = await tx.insert(usageEvents).values({ userId, kind }).returning({ id: usageEvents.id });
    return ins?.id ?? null;
  });
}

/** Refund (delete) a previously reserved session slot. */
export async function refundUsage(eventId: string): Promise<void> {
  await db.delete(usageEvents).where(eq(usageEvents.id, eventId));
}
