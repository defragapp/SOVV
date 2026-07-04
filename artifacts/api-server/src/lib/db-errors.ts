type ErrorLike = {
  code?: string;
  cause?: unknown;
  errors?: unknown;
};

const CONNECTION_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ETIMEDOUT",
  "ECONNRESET",
]);

function asErrorLike(value: unknown): ErrorLike | null {
  return typeof value === "object" && value !== null ? (value as ErrorLike) : null;
}

function hasConnectionErrorCode(value: unknown): boolean {
  const maybe = asErrorLike(value);
  if (!maybe) return false;
  if (typeof maybe.code === "string" && CONNECTION_ERROR_CODES.has(maybe.code)) {
    return true;
  }
  const nestedErrors = Array.isArray(maybe.errors) ? maybe.errors : [];
  return nestedErrors.some((entry) => hasConnectionErrorCode(entry));
}

export function isDatabaseConnectionError(err: unknown): boolean {
  if (hasConnectionErrorCode(err)) return true;
  const maybe = asErrorLike(err);
  if (!maybe) return false;
  return hasConnectionErrorCode(maybe.cause);
}
