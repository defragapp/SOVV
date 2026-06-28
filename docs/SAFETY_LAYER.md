# Safety Layer Documentation

The SOVV Worker API includes a comprehensive safety layer protecting all AI-facing endpoints. This document describes the safety middleware, how it works, and how to verify it.

## Architecture

The safety layer is implemented as a composable middleware stack in `apps/worker/src/middleware/`:

- **`validate-request.ts`** — Request validation (Content-Type, Content-Length, schema validation)
- **`rate-limiter.ts`** — Sliding window rate limiting with configurable presets
- **`safety-logger.ts`** — Event logging and metrics aggregation
- **`safety.ts`** — Core risk detection (keyword matching for crisis signals)

All AI-facing endpoints integrate this stack in a consistent order: validation → rate limiting → risk detection → business logic.

## Integration Order (Per Endpoint)

### 1. Request Validation (First)
- Enforces `application/json` Content-Type
- Enforces Content-Length limits (50KB–100KB depending on endpoint)
- Validates request body against Zod schema

If validation fails:
- Returns early with 400/413/415 response
- Logs `validation_error` event

### 2. Rate Limiting (Second)
- Sliding window algorithm, per-user keying
- Preset: `normal` (default for all AI endpoints)
- Returns 429 if limit exceeded

If rate limit exceeded:
- Logs `rate_limit_exceeded` event
- Returns 429 with Retry-After header

### 3. Risk Detection (Third)
- Inspects user-provided text fields (message, text, content)
- If crisis signals detected: logs `risk_word_detected`, does NOT block
- Existing `supportResponse()` behavior preserved

### 4. Business Logic (Unchanged)
- All existing handler logic runs unchanged
- No modifications to alignment, covenant, audio, explain endpoints

### 5. Error Handling
- Catch blocks log `system_error` events
- Returns 500 with minimal error detail (no stack traces)

## Protected Endpoints

| Endpoint | Method | Max Body | Risk Signals | Rate Limit |
|----------|--------|----------|--------------|-----------|
| `/api/alignment` | POST | 100KB | ✓ | normal |
| `/api/covenant` | POST | 50KB | ✓ | normal |
| `/api/audio` | POST | 50KB | ✗ | normal |
| `/api/explain` | POST | 100KB | ✓ | normal |

## Request Correlation

Each request is assigned a UUID `requestId` generated at handler entry. This ID is included in:
- All safety event logs (for traceability)
- Error responses (via JSON body or header)
- Downstream audit logs

### Example Audit Trail
```
requestId: 550e8400-e29b-41d4-a716-446655440000
timestamp: 1719594233000
userId: user_123
event_type: validation_error
endpoint: /api/alignment
validation_field: content-length
```

## Safety Events

The system logs five event types:

### `validation_error`
- Severity: `low`
- When: Request fails Content-Type, Content-Length, or Zod schema validation
- Details: `{validation_field, endpoint}`

### `rate_limit_exceeded`
- Severity: `low`
- When: User exceeds rate limit for endpoint
- Details: `{endpoint}`

### `risk_word_detected`
- Severity: `high`
- When: Crisis signal keywords detected in user input
- Details: `{riskWord, endpoint}`
- Note: Does NOT block the request

### `system_error`
- Severity: `medium`
- When: Unhandled exception in handler
- Details: `{error, endpoint}`

### `support_response_sent`
- Severity: `low`
- When: Risk word detected and support response returned
- Details: `{endpoint}`

## Storage & Retention

All events stored in Cloudflare KV with daily rotation:
- Key format: `safety-events:YYYY-MM-DD` (UTC)
- Value: Array of SafetyEvent objects (up to 10,000 per day)
- TTL: 7 days (auto-cleanup via KV expiration)

### Metrics Aggregation
```typescript
const metrics = await safetyLogger.getMetrics(60); // Last 60 minutes
// Returns: {
//   totalEvents: 42,
//   eventsByType: { validation_error: 10, rate_limit_exceeded: 5, ... },
//   eventsBySeverity: { low: 30, high: 2, medium: 10 },
//   topRiskWords: [{ word: 'suicide', count: 2 }, ...],
//   topUsers: [{ userId: 'user_123', count: 8 }, ...],
//   timeRange: { start, end }
// }
```

## Verification

### Unit Tests
```bash
cd apps/worker
npm test -- tests/safety.test.ts               # 17 tests
npm test -- tests/validate-request.test.ts     # 19 tests
npm test -- tests/rate-limiter.test.ts         # 21 tests
npm test -- tests/safety-logger.test.ts        # 20 tests
# Total: 77 safety tests passing
```

### TypeScript Validation
```bash
cd apps/worker
npx tsc --noEmit  # Ensures all endpoints compile with safety middleware
```

### Build
```bash
cd apps/worker
npm run build  # Successful build confirms integration
```

## Configuration

### Rate Limit Presets
```typescript
RATE_LIMIT_PRESETS = {
  loose: { requestsPerMinute: 60, windowMs: 60000 },     // 60 req/min
  normal: { requestsPerMinute: 30, windowMs: 60000 },    // 30 req/min (default)
  strict: { requestsPerMinute: 10, windowMs: 60000 },    // 10 req/min
  perSecond: { requestsPerMinute: 10, windowMs: 1000 },  // 10 req/sec
};
```

To use a different preset:
```typescript
const rateLimiter = new RateLimiter(env.KV, RATE_LIMIT_PRESETS.strict);
```

### Validation Schema Examples
```typescript
// alignment.ts
const validationSchema = z.object({
  mode: z.enum(["entry", "workspace", "explore"]).optional(),
  context: z.any().optional(),
});

// covenant.ts
const validationSchema = z.object({
  message: z.string().optional(),
  moment: z.string().optional(),
});
```

## Troubleshooting

### "Request validation failed: content-type"
- Check: Request `Content-Type` header is `application/json`
- Fix: Add `Content-Type: application/json` to HTTP headers

### "Too many requests"
- Cause: Rate limit exceeded for user
- Fix: Wait 60+ seconds or use different rate limit preset

### "Validation error: message (required)"
- Cause: Request body missing required field
- Fix: Check Zod schema for endpoint and add field to request

### "System error in safety logging"
- Cause: KV binding not configured or quota exceeded
- Fix: Check `env.KV` is available; verify KV quota not exceeded

## Adding Safety to New Endpoints

To protect a new AI-facing endpoint:

1. Import safety modules:
```typescript
import { validateRequest } from "./middleware/validate-request.js";
import { RateLimiter, extractRateLimitKey } from "./middleware/rate-limiter.js";
import { KVSafetyLogger, createSafetyEvent } from "./middleware/safety-logger.js";
import { generateRequestId } from "./utils/request-id.js";
```

2. At handler start, create requestId and initialize middleware:
```typescript
const requestId = generateRequestId();
let safetyLogger: KVSafetyLogger | null = null;
let rateLimiter: RateLimiter | null = null;

if (env.KV) {
  safetyLogger = new KVSafetyLogger(env.KV);
  rateLimiter = new RateLimiter(env.KV, RATE_LIMIT_PRESETS.normal);
}
```

3. Validate request (before parsing body):
```typescript
const validationSchema = z.object({
  myField: z.string(),
});

const validationResult = await validateRequest(request, validationSchema, {
  validateContentType: true,
  maxBodySize: 100 * 1024,
});

if (!validationResult.valid) {
  const errorResult = validationResult as { valid: false; error: any };
  if (safetyLogger && user) {
    await safetyLogger.log(
      createSafetyEvent(user.id, "validation_error", "low", {
        validation_field: errorResult.error.field,
        endpoint: "/api/my-endpoint",
      }, { requestId })
    );
  }
  return new Response(...);
}
```

4. Apply rate limiting:
```typescript
if (rateLimiter) {
  const rateLimitKey = extractRateLimitKey(request, user.id);
  const limitResult = await rateLimiter.checkLimit(rateLimitKey);
  if (!limitResult.allowed) {
    // Log and return 429
  }
}
```

5. Check for risk signals (non-blocking):
```typescript
if (safetyMode(userInput) === "support") {
  if (safetyLogger && user) {
    await safetyLogger.log(
      createSafetyEvent(user.id, "risk_word_detected", "high", { ... }, { requestId })
    );
  }
}
```

6. Wrap handler in try-catch:
```typescript
try {
  // Business logic
} catch (error: any) {
  if (user && safetyLogger) {
    await safetyLogger.log(
      createSafetyEvent(user.id, "system_error", "medium", { error: error?.message }, { requestId })
    );
  }
  return new Response(...);
}
```

## References

- **Middleware**: `apps/worker/src/middleware/`
- **Tests**: `apps/worker/tests/`
- **Risk words**: `apps/worker/src/safety.ts`
- **Endpoint implementations**: `apps/worker/src/alignment.ts`, `covenant.ts`, `audio.ts`, `explain-extended.ts`
