import { afterEach, describe, expect, it, vi } from "vitest";
import { finalizeResponse } from "../src/index";
import { trackRuntimeOutcome } from "../src/safety";
import type { Env } from "../src/types-env";

type WaitUntilContext = ExecutionContext & { promises: Promise<unknown>[] };

function createWaitUntilContext(): WaitUntilContext {
  const promises: Promise<unknown>[] = [];
  return {
    promises,
    waitUntil(promise: Promise<unknown>) {
      promises.push(promise);
    },
    passThroughOnException() {},
    props: {},
  } as WaitUntilContext;
}

function createRequest(path = "/api/test", headers: Record<string, string> = {}): Request {
  return new Request(`https://example.com${path}`, {
    method: "POST",
    headers: {
      "x-request-id": "test-request",
      "x-endpoint": `POST ${path}`,
      ...headers,
    },
  });
}

function createEnv(overrides: Partial<Env> = {}): Env {
  const kv = {
    get: vi.fn(async () => null),
    put: vi.fn(async () => undefined),
  };

  return {
    DB: {} as Env["DB"],
    KV: kv as unknown as Env["KV"],
    AI: {} as Env["AI"],
    AI_SERVICE: {} as Env["AI_SERVICE"],
    SESSION_SERVICE: {} as Env["SESSION_SERVICE"],
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("finalizeResponse response normalization", () => {
  it("preserves 3xx redirect responses without rewriting them to JSON", async () => {
    const env = createEnv();
    const ctx = createWaitUntilContext();
    const response = await finalizeResponse(
      createRequest("/api/redirect"),
      new Response("moved", {
        status: 302,
        headers: { Location: "https://example.com/next", "Content-Type": "text/plain" },
      }),
      Date.now(),
      env,
      ctx,
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("https://example.com/next");
    expect(response.headers.get("Content-Type")).toContain("text/plain");
    await expect(response.text()).resolves.toBe("moved");
    await Promise.all(ctx.promises);
  });

  it("preserves 304 responses as bodyless and unmodified", async () => {
    const env = createEnv();
    const ctx = createWaitUntilContext();
    const response = await finalizeResponse(
      createRequest("/api/cache"),
      new Response(null, { status: 304, headers: { ETag: '"abc"' } }),
      Date.now(),
      env,
      ctx,
    );

    expect(response.status).toBe(304);
    expect(response.headers.get("ETag")).toBe('"abc"');
    expect(response.headers.get("Content-Type")).toBeNull();
    expect(response.body).toBeNull();
    await Promise.all(ctx.promises);
  });

  it("normalizes successful JSON and text responses", async () => {
    const env = createEnv();
    const jsonCtx = createWaitUntilContext();
    const textCtx = createWaitUntilContext();

    const jsonResponse = await finalizeResponse(
      createRequest("/api/json"),
      new Response(JSON.stringify({ data: { ok: true } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
      Date.now(),
      env,
      jsonCtx,
    );
    await expect(jsonResponse.json()).resolves.toMatchObject({
      success: true,
      requestId: "test-request",
      data: { ok: true },
    });

    const textResponse = await finalizeResponse(
      createRequest("/api/text"),
      new Response("done", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      }),
      Date.now(),
      env,
      textCtx,
    );
    await expect(textResponse.json()).resolves.toMatchObject({
      success: true,
      requestId: "test-request",
      message: "done",
    });

    await Promise.all([...jsonCtx.promises, ...textCtx.promises]);
  });

  it("normalizes error responses", async () => {
    const env = createEnv();
    const ctx = createWaitUntilContext();
    const response = await finalizeResponse(
      createRequest("/api/fail"),
      new Response("bad input", {
        status: 400,
        statusText: "Bad Request",
        headers: { "Content-Type": "text/plain" },
      }),
      Date.now(),
      env,
      ctx,
    );

    await expect(response.json()).resolves.toMatchObject({
      success: false,
      requestId: "test-request",
      error: "bad input",
    });
    await Promise.all(ctx.promises);
  });
});

describe("finalizeResponse runtime tracking", () => {
  it("schedules trackRuntimeOutcome with ctx.waitUntil", async () => {
    const env = createEnv();
    const ctx = createWaitUntilContext();

    await finalizeResponse(
      createRequest("/api/tracked"),
      new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } }),
      Date.now(),
      env,
      ctx,
    );

    expect(ctx.promises).toHaveLength(1);
    await Promise.all(ctx.promises);
    expect(env.KV.put).toHaveBeenCalled();
  });

  it("does not block the user response on delayed runtime tracking", async () => {
    let resolveGet: (value: string | null) => void = () => undefined;
    const delayedGet = new Promise<string | null>((resolve) => {
      resolveGet = resolve;
    });
    const env = createEnv({
      KV: {
        get: vi.fn(() => delayedGet),
        put: vi.fn(async () => undefined),
      } as unknown as Env["KV"],
    });
    const ctx = createWaitUntilContext();

    const response = await finalizeResponse(
      createRequest("/api/slow-metrics"),
      new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } }),
      Date.now(),
      env,
      ctx,
    );

    expect(response.status).toBe(200);
    expect(ctx.promises).toHaveLength(1);

    resolveGet(null);
    await Promise.all(ctx.promises);
  });

  it("logs async tracking failures without changing the user response", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const env = createEnv({
      KV: {
        get: vi.fn(async () => {
          throw new Error("KV unavailable");
        }),
        put: vi.fn(async () => undefined),
      } as unknown as Env["KV"],
    });
    const ctx = createWaitUntilContext();

    const response = await finalizeResponse(
      createRequest("/api/tracking-fails"),
      new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } }),
      Date.now(),
      env,
      ctx,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ success: true });
    await Promise.all(ctx.promises);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("runtime_outcome_tracking_failed"));
  });

  it("documents that response headers report the active request protection level", async () => {
    const env = createEnv();
    const ctx = createWaitUntilContext();
    const response = await finalizeResponse(
      createRequest("/api/protected", { "x-protection-level": "1" }),
      new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } }),
      Date.now(),
      env,
      ctx,
    );

    expect(response.headers.get("x-protection-level")).toBe("1");
    await Promise.all(ctx.promises);
  });
});

describe("trackRuntimeOutcome protection transitions", () => {
  const fixedMinute = "2026-06-29T16:45";

  function createTransitionEnv(rawState: unknown, rawCounters: unknown = null): Env {
    return createEnv({
      KV: {
        get: vi.fn(async (key: string) => {
          if (key.includes("runtime:protection")) return JSON.stringify(rawState);
          if (key.includes("runtime:metrics") && rawCounters) return JSON.stringify(rawCounters);
          return null;
        }),
        put: vi.fn(async () => undefined),
      } as unknown as Env["KV"],
    });
  }

  it("logs runtime_protection_escalated on level increases", async () => {
    vi.setSystemTime(new Date(`${fixedMinute}:00.000Z`));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const env = createTransitionEnv({ level: 0, consecutive_anomaly_minutes: 0 }, {
      minute: fixedMinute,
      requests: 59,
      errors: 0,
      rate_limits: 0,
      ai_failures: 0,
      duration_total_ms: 0,
      duration_count: 0,
    });

    await expect(trackRuntimeOutcome(env, createRequest("/api/alignment"), { status: 200, durationMs: 25 })).resolves.toBe(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("runtime_protection_escalated"));
  });

  it("logs runtime_protection_deescalated on level decreases that remain protected", async () => {
    vi.setSystemTime(new Date(`${fixedMinute}:00.000Z`));
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const env = createTransitionEnv({ level: 2, consecutive_anomaly_minutes: 0 }, {
      minute: fixedMinute,
      requests: 59,
      errors: 0,
      rate_limits: 0,
      ai_failures: 0,
      duration_total_ms: 0,
      duration_count: 0,
    });

    await expect(trackRuntimeOutcome(env, createRequest("/api/alignment"), { status: 200, durationMs: 25 })).resolves.toBe(1);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("runtime_protection_deescalated"));
  });

  it("logs runtime_recovered on full recovery to level 0", async () => {
    vi.setSystemTime(new Date(`${fixedMinute}:00.000Z`));
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const env = createTransitionEnv({ level: 1, consecutive_anomaly_minutes: 0 });

    await expect(trackRuntimeOutcome(env, createRequest("/api/alignment"), { status: 200, durationMs: 25 })).resolves.toBe(0);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("runtime_recovered"));
  });
});
