import type { Request, Response, NextFunction } from "express";
import { db, sessions, users } from "@workspace/db";
import { eq } from "drizzle-orm";

// Augment Express Request with user data
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      user?: { id: string; email: string; tier: string };
    }
  }
}

const SESSION_COOKIE = "sovv_session";

/** Resolves session from cookie and attaches req.user. Returns 401 if missing/expired. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!sessionId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
    if (!session || session.expiresAt < new Date()) {
      res.clearCookie(SESSION_COOKIE);
      return res.status(401).json({ error: "Session expired" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (!user) return res.status(401).json({ error: "User not found" });

    req.userId = user.id;
    req.user   = { id: user.id, email: user.email, tier: user.tier };
    return next();
  } catch (err) {
    console.error("[auth] middleware error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/** Like requireAuth but never rejects — attaches req.user if valid session exists. */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!sessionId) return next();
  try {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
    if (!session || session.expiresAt < new Date()) return next();
    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (user) {
      req.userId = user.id;
      req.user   = { id: user.id, email: user.email, tier: user.tier };
    }
  } catch { /* silent */ }
  return next();
}

export { SESSION_COOKIE };
