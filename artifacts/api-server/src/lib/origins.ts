const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
];

export function extractOriginHost(raw: string): string {
  try {
    const u = new URL(raw);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}

export function getAllowedOrigins(): string[] {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (process.env.REPLIT_DEV_DOMAIN) {
    return [`https://${process.env.REPLIT_DEV_DOMAIN}`];
  }

  return DEFAULT_ALLOWED_ORIGINS;
}

export function isAllowedOrigin(origin: string | undefined | null): boolean {
  if (!origin) return false;
  const normalized = extractOriginHost(origin);
  if (!normalized) return false;
  return getAllowedOrigins().some((o) => extractOriginHost(o) === normalized);
}