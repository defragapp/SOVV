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

export class ConflictSessionDO extends DurableObject<Env> {
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
    if (!data) return;

    let parsed: { type?: string; content?: string; text?: string };
    try {
      parsed = JSON.parse(data);
    } catch {
      parsed = { content: data };
    }

    const messageContent = parsed.content ?? parsed.text ?? data;

    const senderAttachment = ws.deserializeAttachment() as WebSocketAttachment | null;
    const senderUserId = senderAttachment?.userId ?? "unknown";

    const sharedPayload = JSON.stringify({
      type: "shared",
      userId: senderUserId,
      content: messageContent,
      timestamp: Date.now(),
    });
    this.broadcastShared(sharedPayload);

    const uniqueUserIds = new Set<string>();
    for (const socket of this.ctx.getWebSockets()) {
      const attachment = socket.deserializeAttachment() as WebSocketAttachment | null;
      if (attachment?.userId) {
        uniqueUserIds.add(attachment.userId);
      }
    }

    const privatePromises = Array.from(uniqueUserIds).map(async (userId) => {
      try {
        const aiResponse = await this.env.AI_SERVICE.fetch(
          "http://internal/emotional-drivers",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: this.ctx.id.toString(),
              targetUserId: userId,
              transcriptChunk: messageContent,
            }),
          }
        );

        if (!aiResponse.ok) return;

        const drivers = (await aiResponse.json()) as EmotionalDriversResponse;

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
        console.error(`Failed to get emotional drivers for ${userId}:`, err);
      }
    });

    this.ctx.waitUntil(Promise.all(privatePromises));
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
}
