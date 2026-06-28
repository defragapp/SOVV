import { jsonResponse } from "./auth.js";
import { getCorsHeaders } from "./cors.js";
import { safetyMode, supportResponse } from "./safety.js";

export type JsonBody = Record<string, unknown>;

type ValidationSuccess<T> = { ok: true; value: T };
type ValidationFailure = { ok: false; response: Response };

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

interface ResponseOptions {
  headers?: Record<string, string>;
  invalidJsonPayload?: unknown;
  invalidBodyPayload?: unknown;
}

interface TextValidationOptions {
  request: Request;
  body: JsonBody;
  fields: string[];
  requiredPayload: unknown;
  tooLongPayload?: unknown;
  maxLength?: number;
  headers?: Record<string, string>;
  supportMode?: boolean;
}

function failure(
  request: Request,
  status: number,
  payload: unknown,
  headers?: Record<string, string>,
): ValidationFailure {
  return {
    ok: false,
    response: jsonResponse(payload, status, {
      ...getCorsHeaders(request),
      ...headers,
    }),
  };
}

export async function parseJsonBody(
  request: Request,
  options: ResponseOptions = {},
): Promise<ValidationResult<JsonBody>> {
  let parsed: unknown;

  try {
    parsed = await request.json();
  } catch {
    return failure(
      request,
      400,
      options.invalidJsonPayload ?? { error: "invalid_json", message: "Invalid JSON body." },
      options.headers,
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return failure(
      request,
      400,
      options.invalidBodyPayload ?? { error: "invalid_body", message: "JSON body must be an object." },
      options.headers,
    );
  }

  return { ok: true, value: parsed as JsonBody };
}

export function validateTextInput(
  options: TextValidationOptions,
): ValidationResult<{ text: string; field: string }> {
  const { request, body, fields, requiredPayload, tooLongPayload, maxLength, headers, supportMode = false } = options;

  for (const field of fields) {
    const rawValue = body[field];
    if (typeof rawValue !== "string") {
      continue;
    }

    const text = rawValue.trim();
    if (!text) {
      continue;
    }

    if (typeof maxLength === "number" && text.length > maxLength) {
      return failure(
        request,
        400,
        tooLongPayload ?? { error: `Input too long. Please keep it under ${maxLength} characters.` },
        headers,
      );
    }

    if (supportMode && safetyMode(text) === "support") {
      return {
        ok: false,
        response: jsonResponse(supportResponse(), 200, {
          ...getCorsHeaders(request),
          ...headers,
        }),
      };
    }

    return { ok: true, value: { text, field } };
  }

  return failure(request, 400, requiredPayload, headers);
}
