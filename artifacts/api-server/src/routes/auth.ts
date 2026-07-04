import { Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { db, users, sessions } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SESSION_COOKIE, requireAuth } from "../middlewares/auth";

const router = Router();

const BCRYPT_ROUNDS = 11;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function cookieOpts() {
  return {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge:   SESSION_TTL_MS,
    path:     "/",
  };
}

function publicUser(u: { id: string; email: string; tier: string }) {
  return { id: u.id, email: u.email, tier: u.tier };
}

// ── GET /api/auth/people ──────────────────────────────────────────────────────
// Minimal Relational Matrix: returns the authenticated user as their own "self"
// node. Full people management (add/edit others) is a separate feature.
router.get("/people", requireAuth, (req: Request, res: Response) => {
  const email = req.user?.email ?? "";
  const name = email.split("@")[0] || "You";
  return res.json({ people: [{ id: req.userId!, name, relation: "self" }] });
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const emailLower = String(email).toLowerCase().trim();
  if (String(password).length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

  try {
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, emailLower)).limit(1);
    if (existing.length > 0) return res.status(409).json({ error: "An account with this email already exists" });

    const passwordHash = await bcrypt.hash(String(password), BCRYPT_ROUNDS);
    const [user] = await db.insert(users).values({ email: emailLower, passwordHash }).returning();

    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const [session] = await db.insert(sessions).values({ userId: user.id, expiresAt }).returning();

    res.cookie(SESSION_COOKIE, session.id, cookieOpts());
    return res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    console.error("[auth/register]", err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const emailLower = String(email).toLowerCase().trim();

  try {
    const [user] = await db.select().from(users).where(eq(users.email, emailLower)).limit(1);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(String(password), user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const [session] = await db.insert(sessions).values({ userId: user.id, expiresAt }).returning();

    res.cookie(SESSION_COOKIE, session.id, cookieOpts());
    return res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("[auth/login]", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post("/logout", async (req: Request, res: Response) => {
  const sessionId = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (sessionId) {
    try { await db.delete(sessions).where(eq(sessions.id, sessionId)); } catch { /* ignore */ }
  }
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  return res.json({ ok: true });
});

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
// Extend session TTL — called by SpaceShell on mount.
router.post("/refresh", async (req: Request, res: Response) => {
  const sessionId = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!sessionId) return res.status(401).json({ error: "No session" });

  try {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await db.update(sessions).set({ expiresAt }).where(eq(sessions.id, sessionId));
    res.cookie(SESSION_COOKIE, sessionId, cookieOpts());
    return res.json({ ok: true });
  } catch (err) {
    console.error("[auth/refresh]", err);
    return res.status(500).json({ error: "Refresh failed" });
  }
});

export default router;
