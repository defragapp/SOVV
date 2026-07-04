import { Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { createHmac, timingSafeEqual } from "node:crypto";
import { db, users, sessions } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SESSION_COOKIE, requireAuth } from "../middlewares/auth";
import { isDatabaseConnectionError } from "../lib/db-errors";
import { createRateLimiter } from "../middlewares/rate-limit";

const router = Router();

const BCRYPT_ROUNDS = 11;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

const emailScopedKey = (req: Request): string => {
  const email = String(req.body?.email ?? "").toLowerCase().trim();
  return `${req.ip || "unknown"}:${email || "none"}`;
};

const registerLimiter = createRateLimiter({
  keyPrefix: "auth-register",
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: "Too many registration attempts. Please try again later.",
  keyGenerator: emailScopedKey,
});

const loginLimiter = createRateLimiter({
  keyPrefix: "auth-login",
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: "Too many login attempts. Please try again later.",
  keyGenerator: emailScopedKey,
});

const forgotPasswordLimiter = createRateLimiter({
  keyPrefix: "auth-forgot-password",
  windowMs: 15 * 60 * 1000,
  max: 6,
  message: "Too many password reset requests. Please try again later.",
  keyGenerator: emailScopedKey,
});

const resetPasswordLimiter = createRateLimiter({
  keyPrefix: "auth-reset-password",
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many reset attempts. Please try again later.",
});

function getResetTokenSecret(): string | null {
  const secret = process.env.RESET_TOKEN_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") return "dev-reset-secret-change-me";
  return null;
}

function signResetToken(payloadBase64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadBase64).digest("base64url");
}

function createResetToken(userId: string, secret: string): string {
  const payload = JSON.stringify({ uid: userId, exp: Date.now() + RESET_TOKEN_TTL_MS });
  const payloadBase64 = Buffer.from(payload, "utf8").toString("base64url");
  const signature = signResetToken(payloadBase64, secret);
  return `${payloadBase64}.${signature}`;
}

function verifyResetToken(token: string, secret: string): { uid: string; exp: number } | null {
  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) return null;

  const expectedSig = signResetToken(payloadBase64, secret);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf8")) as {
      uid?: string;
      exp?: number;
    };
    if (!parsed.uid || !parsed.exp) return null;
    if (parsed.exp < Date.now()) return null;
    return { uid: parsed.uid, exp: parsed.exp };
  } catch {
    return null;
  }
}

function getAppOrigin(req: Request): string {
  const configured = process.env.APP_ORIGIN?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("APP_ORIGIN must be configured in production");
  }
  return req.get("origin") ?? `${req.protocol}://${req.get("host")}`;
}

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
router.post("/register", registerLimiter, async (req: Request, res: Response) => {
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
    if (isDatabaseConnectionError(err)) {
      return res.status(503).json({ error: "Database unavailable" });
    }
    return res.status(500).json({ error: "Registration failed" });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", loginLimiter, async (req: Request, res: Response) => {
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
    if (isDatabaseConnectionError(err)) {
      return res.status(503).json({ error: "Database unavailable" });
    }
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
    if (isDatabaseConnectionError(err)) {
      return res.status(503).json({ error: "Database unavailable" });
    }
    return res.status(500).json({ error: "Refresh failed" });
  }
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
// Returns 200 for both existing and non-existing users to avoid account probing.
router.post("/forgot-password", forgotPasswordLimiter, async (req: Request, res: Response) => {
  const email = String(req.body?.email ?? "").toLowerCase().trim();
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const [user] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email)).limit(1);
    const secret = getResetTokenSecret();

    if (user && secret) {
      const token = createResetToken(user.id, secret);
      const origin = getAppOrigin(req);
      const resetUrl = `${origin}/app/reset-password?token=${encodeURIComponent(token)}`;

      if (process.env.NODE_ENV !== "production") {
        console.info("[auth/forgot-password] reset link generated", { email: user.email, resetUrl });
        return res.json({ ok: true, token, resetUrl });
      }

      console.info("[auth/forgot-password] reset requested", { email: user.email });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("[auth/forgot-password]", err);
    if (isDatabaseConnectionError(err)) {
      return res.status(503).json({ error: "Database unavailable" });
    }
    return res.status(500).json({ error: "Failed to process password reset" });
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────
router.post("/reset-password", resetPasswordLimiter, async (req: Request, res: Response) => {
  const token = String(req.body?.token ?? "").trim();
  const password = String(req.body?.password ?? "");
  if (!token) return res.status(400).json({ error: "Reset token is required" });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

  const secret = getResetTokenSecret();
  if (!secret) return res.status(503).json({ error: "Reset service not configured" });

  const parsed = verifyResetToken(token, secret);
  if (!parsed) return res.status(400).json({ error: "Invalid or expired reset token" });

  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const updated = await db.update(users).set({ passwordHash }).where(eq(users.id, parsed.uid)).returning({ id: users.id });
    if (updated.length === 0) return res.status(400).json({ error: "Invalid or expired reset token" });

    await db.delete(sessions).where(eq(sessions.userId, parsed.uid));
    res.clearCookie(SESSION_COOKIE, { path: "/" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[auth/reset-password]", err);
    if (isDatabaseConnectionError(err)) {
      return res.status(503).json({ error: "Database unavailable" });
    }
    return res.status(500).json({ error: "Failed to reset password" });
  }
});

// ── POST /api/auth/verify-email ──────────────────────────────────────────────
// Reserved endpoint for future verified-email state. Currently validates token presence.
router.post("/verify-email", async (req: Request, res: Response) => {
  const token = String(req.body?.token ?? "").trim();
  if (!token) return res.status(400).json({ error: "Verification token is required" });
  return res.json({ ok: true });
});

export default router;
