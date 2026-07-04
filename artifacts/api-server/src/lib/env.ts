import { extractOriginHost, getAllowedOrigins } from "./origins";

function requiredInProduction(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required in production`);
  }
  return value;
}

export function validateRuntimeEnv(): void {
  if (process.env.NODE_ENV !== "production") return;

  const appOriginRaw = requiredInProduction("APP_ORIGIN");
  const resetSecret = requiredInProduction("RESET_TOKEN_SECRET");
  requiredInProduction("ALLOWED_ORIGINS");

  if (resetSecret.length < 32) {
    throw new Error("RESET_TOKEN_SECRET must be at least 32 characters in production");
  }

  const appOrigin = extractOriginHost(appOriginRaw);
  if (!appOrigin) {
    throw new Error(`APP_ORIGIN is invalid: \"${appOriginRaw}\"`);
  }

  const allowedOrigins = getAllowedOrigins();
  const appOriginAllowed = allowedOrigins.some((origin) => extractOriginHost(origin) === appOrigin);
  if (!appOriginAllowed) {
    throw new Error("APP_ORIGIN must be included in ALLOWED_ORIGINS in production");
  }
}