export class ConflictSessionDO {
  // Map to store user IDs and their associated WebSocket connections
  userConnections: Map<string, WebSocket[]> = new Map();
  // Shared state accessible to all users
  sharedState = {};
  // Private state restricted to individual users
  privateState: Record<string, any[]> = {};

  constructor(private state: DurableObjectState) {}

  async fetch(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId || request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected Upgrade: websocket with userId', { status: 426 });
    }

    const [client, server] = new WebSocketPair();
    await this.handleConnection(userId, server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async handleConnection(userId: string, socket: WebSocket) {
    socket.accept();
    
    // Save the connection
    const connections = this.userConnections.get(userId) || [];
    connections.push(socket);
    this.userConnections.set(userId, connections);

    socket.addEventListener('message', (event) => {
      // On message, broadcast as a transcript to all users
      this.broadcastShared({ type: 'transcript', text: event.data });
    });

    socket.addEventListener('close', () => {
      const connections = this.userConnections.get(userId) || [];
      this.userConnections.set(userId, connections.filter(s => s !== socket));
    });
  }

  // Send a message to all connected users
  broadcastShared(message: any) {
    const data = JSON.stringify(message);
    for (const connections of this.userConnections.values()) {
      connections.forEach(socket => socket.send(data));
    }
  }

  // Send a message only to a specific user
  sendPrivate(userId: string, message: any) {
    const connections = this.userConnections.get(userId);
    if (connections) {
      const data = JSON.stringify(message);
      connections.forEach(socket => socket.send(data));
    }
  }
}
