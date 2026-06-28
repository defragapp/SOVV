import { DurableObject } from "cloudflare:workers";

interface Env {
  CONFLICT_SESSION: DurableObjectNamespace;
  AI_SERVICE: Fetcher;
  BASELINE_KV?: KVNamespace;
}

interface WebSocketAttachment {
  userId: string;
}

interface EmotionalDriversResponse {
  privateView: {
    headline: string;
    summary: string;
    suggestions: string[];
  };
  sharedView: {
    headline: string;
    summary: string;
  };
}

const MAX_MESSAGE_CHARS = 8_000;
const MAX_PENDING_MESSAGES = 50;
const MAX_CONCURRENT_AI_PER_MESSAGE = 2;
const MAX_CONCURRENT_SESSION_OPERATIONS = 4;
const AI_TIMEOUT_MS = 12_000;
const AI_FAILURE_THRESHOLD = 5;
const AI_COOLDOWN_MS = 30_000;

interface PendingMessage {
  senderUserId: string;
  content: string;
}

export class ConflictSessionDO extends DurableObject<Env> {
  private pendingMessages: PendingMessage[] = [];
  private processingQueue = false;
  private activeSessionOperations = 0;
  private consecutiveAiFailures = 0;
  private circuitOpenUntil = 0;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/ws")) {
      const upgradeHeader = request.headers.get("Upgrade");
      if (upgradeHeader !== "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
      }

      const userId = url.searchParams.get("userId");
      if (!userId) {
        return new Response("Missing userId query parameter", { status: 400 });
      }

      const pair = new WebSocketPair();
      const client = pair[0] as WebSocket;
      const server = pair[1] as WebSocket;

      this.ctx.acceptWebSocket(server, [userId]);
      server.serializeAttachment({ userId } as WebSocketAttachment);

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response("Not found", { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const data = typeof message === "string" ? message : "";
    if (!data) {
      return;
    }

    let parsed: { type?: string; content?: string; text?: string };
    try {
      parsed = JSON.parse(data);
    } catch {
      parsed = { content: data };
    }

    const messageContent = (parsed.content ?? parsed.text ?? data).slice(0, MAX_MESSAGE_CHARS);

    const senderAttachment = ws.deserializeAttachment() as WebSocketAttachment | null;
    const senderUserId = senderAttachment?.userId ?? "unknown";

    this.enqueueMessage({
      senderUserId,
      content: messageContent,
    });

    const sharedPayload = JSON.stringify({
      type: "shared",
      userId: senderUserId,
      content: messageContent,
      timestamp: Date.now(),
    });
    this.broadcastShared(sharedPayload);
    this.ctx.waitUntil(this.processQueue());
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string
  ): Promise<void> {
    // Socket is already closing — no action needed
  }

  private broadcastShared(message: string): void {
    for (const ws of this.ctx.getWebSockets()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  }

  private sendPrivate(userId: string, message: string): void {
    const sockets = this.ctx.getWebSockets(userId);
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  }

  private logSystemError(reason: string, details?: Record<string, unknown>): void {
    console.error(
      JSON.stringify({
        type: "system_error",
        reason,
        timestamp: Date.now(),
        ...(details ?? {}),
      })
    );
  }

  private enqueueMessage(message: PendingMessage): void {
    if (this.pendingMessages.length >= MAX_PENDING_MESSAGES) {
      this.pendingMessages.shift();
      this.logSystemError("queue_overflow", { dropped: true, maxPending: MAX_PENDING_MESSAGES });
    }
    this.pendingMessages.push(message);
  }

  private isCircuitOpen(): boolean {
    return this.circuitOpenUntil > Date.now();
  }

  private markAiFailure(): void {
    this.consecutiveAiFailures += 1;
    if (this.consecutiveAiFailures >= AI_FAILURE_THRESHOLD) {
      this.circuitOpenUntil = Date.now() + AI_COOLDOWN_MS;
      this.logSystemError("circuit_open", {
        failureThreshold: AI_FAILURE_THRESHOLD,
        cooldownMs: AI_COOLDOWN_MS,
      });
    }
  }

  private markAiSuccess(): void {
    this.consecutiveAiFailures = 0;
    this.circuitOpenUntil = 0;
  }

  private async processQueue(): Promise<void> {
    if (this.processingQueue) {
      return;
    }
    this.processingQueue = true;
    try {
      while (this.pendingMessages.length > 0) {
        const item = this.pendingMessages.shift();
        if (!item) {
          continue;
        }
        await this.processSingleMessage(item);
      }
    } finally {
      this.processingQueue = false;
    }
  }

  private async processSingleMessage(message: PendingMessage): Promise<void> {
    if (this.isCircuitOpen()) {
      this.sendPrivate(
        message.senderUserId,
        JSON.stringify({ success: false, error: "service_unavailable", type: "driver_update_error" })
      );
      this.logSystemError("circuit_open");
      return;
    }

    const uniqueUserIds = new Set<string>();
    for (const socket of this.ctx.getWebSockets()) {
      const attachment = socket.deserializeAttachment() as WebSocketAttachment | null;
      if (attachment?.userId) {
        uniqueUserIds.add(attachment.userId);
      }
    }

    const targets = Array.from(uniqueUserIds);
    const queue = [...targets];
    const workers: Promise<void>[] = [];
    const workerCount = Math.min(MAX_CONCURRENT_AI_PER_MESSAGE, queue.length);

    for (let i = 0; i < workerCount; i++) {
      workers.push((async () => {
        while (queue.length > 0) {
          const userId = queue.shift();
          if (!userId) continue;
          await this.runAiForUser(userId, message);
        }
      })());
    }
    await Promise.all(workers);
  }

  private async runAiForUser(userId: string, message: PendingMessage): Promise<void> {
    if (this.activeSessionOperations >= MAX_CONCURRENT_SESSION_OPERATIONS) {
      this.logSystemError("session_concurrency_exceeded", {
        active: this.activeSessionOperations,
        max: MAX_CONCURRENT_SESSION_OPERATIONS,
      });
      this.sendPrivate(
        userId,
        JSON.stringify({ success: false, error: "service_unavailable", type: "driver_update_error" })
      );
      return;
    }

    this.activeSessionOperations += 1;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("timeout"), AI_TIMEOUT_MS);
    try {
      const aiResponse = await this.env.AI_SERVICE.fetch("http://internal/emotional-drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: this.ctx.id.toString(),
          targetUserId: userId,
          transcriptChunk: message.content,
        }),
        signal: controller.signal,
      });

      if (!aiResponse.ok) {
        this.markAiFailure();
        return;
      }

      const drivers = (await aiResponse.json()) as EmotionalDriversResponse;
      this.markAiSuccess();
      this.sendPrivate(
        userId,
        JSON.stringify({
          type: "driver_update",
          targetUserId: userId,
          privateView: drivers.privateView,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      const reason =
        err instanceof Error && (err.name === "AbortError" || err.message === "timeout")
          ? "timeout"
          : "ai_service_error";
      this.logSystemError(reason, {
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
      this.markAiFailure();
      this.sendPrivate(
        userId,
        JSON.stringify({ success: false, error: "service_unavailable", type: "driver_update_error" })
      );
    } finally {
      clearTimeout(timeout);
      this.activeSessionOperations = Math.max(0, this.activeSessionOperations - 1);
    }
  }
}
