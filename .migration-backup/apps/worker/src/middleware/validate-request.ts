import { z } from "zod";

export interface ValidationError {
  field: string;
  error: string;
  status: number;
}

export type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; error: ValidationError };

/**
 * Validates request Content-Type header
 */
export function validateContentType(
  req: Request,
  expected: string = "application/json"
): ValidationResult<void> {
  const contentType = req.headers.get("content-type");
  if (!contentType?.includes(expected)) {
    return {
      valid: false,
      error: {
        field: "content-type",
        error: `Expected ${expected}`,
        status: 415,
      },
    };
  }
  return { valid: true, data: undefined };
}

/**
 * Validates request body size
 */
export function validateContentLength(
  req: Request,
  maxBytes: number = 1024 * 100 // 100KB default
): ValidationResult<void> {
  const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
  if (contentLength > maxBytes) {
    return {
      valid: false,
      error: {
        field: "content-length",
        error: `Max size ${maxBytes} bytes, got ${contentLength}`,
        status: 413,
      },
    };
  }
  return { valid: true, data: undefined };
}

/**
 * Parses and validates JSON body against a Zod schema
 */
export async function validateJsonBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
  let body: unknown;

  try {
    body = await req.json();
  } catch (err) {
    return {
      valid: false,
      error: {
        field: "body",
        error: `Invalid JSON: ${err instanceof Error ? err.message : "unknown error"}`,
        status: 400,
      },
    };
  }

  try {
    const data = schema.parse(body);
    return { valid: true, data };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      return {
        valid: false,
        error: {
          field: issue.path.join(".") || "body",
          error: issue.message,
          status: 400,
        },
      };
    }
    return {
      valid: false,
      error: {
        field: "body",
        error: "Validation failed",
        status: 400,
      },
    };
  }
}

/**
 * Combines multiple validation steps
 */
export async function validateRequest<T>(
  req: Request,
  schema: z.ZodSchema<T>,
  options: {
    validateContentType?: boolean;
    maxBodySize?: number;
  } = {}
): Promise<ValidationResult<T>> {
  const { validateContentType: checkContentType = true, maxBodySize } = options;

  // Step 1: Validate Content-Type
  if (checkContentType) {
    const ctResult = validateContentType(req);
    if (!ctResult.valid) return ctResult as any;
  }

  // Step 2: Validate Content-Length
  if (maxBodySize !== undefined) {
    const clResult = validateContentLength(req, maxBodySize);
    if (!clResult.valid) return clResult as any;
  }

  // Step 3: Parse and validate JSON body
  return validateJsonBody(req, schema);
}
