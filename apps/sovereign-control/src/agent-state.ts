// AgentState Durable Object — governed flow engine with SQLite storage

export class AgentState {
  state: DurableObjectState
  env: any

  constructor(state: DurableObjectState, env: any) {
    this.state = state
    this.env = env
    this.state.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY,
        title TEXT,
        created_at INTEGER,
        updated_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id TEXT,
        role TEXT,
        content TEXT,
        created_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS flows (
        id TEXT PRIMARY KEY,
        thread_id TEXT,
        state TEXT,
        target TEXT,
        payload_hash TEXT,
        mode TEXT,
        risk TEXT,
        confirm_required INTEGER DEFAULT 0,
        confirmed INTEGER DEFAULT 0,
        confirmed_by TEXT,
        outcome TEXT,
        log_id TEXT,
        created_at INTEGER,
        updated_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        log_id TEXT,
        flow_id TEXT,
        actor TEXT,
        role TEXT,
        action TEXT,
        step TEXT,
        target TEXT,
        mode TEXT,
        risk TEXT,
        payload_hash TEXT,
        outcome TEXT,
        reason TEXT,
        timestamp INTEGER
      );
      CREATE TABLE IF NOT EXISTS project_context (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at INTEGER
      );
    `)

    // Seed project context if empty
    const rows = [...this.state.storage.sql.exec('SELECT COUNT(*) as c FROM project_context')]
    if ((rows[0] as any)?.c === 0) {
      this.state.storage.sql.exec(
        `INSERT INTO project_context (key, value, updated_at) VALUES
          ('project_name','SOVV',?),
          ('repo','defragapp/SOVV',?),
          ('framework','Next.js 15 + OpenNext',?),
          ('platform','Cloudflare Workers',?),
          ('api_domain','api.defrag.app',?),
          ('app_domain','app.defrag.app',?)`,
        Date.now(), Date.now(), Date.now(), Date.now(), Date.now(), Date.now()
      )
    }
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // Threads
    if (url.pathname === '/db/threads' && request.method === 'GET') {
      return json([...this.state.storage.sql.exec('SELECT * FROM threads ORDER BY updated_at DESC')])
    }
    if (url.pathname === '/db/thread' && request.method === 'POST') {
      const { id, title } = await request.json() as any
      const now = Math.floor(Date.now() / 1000)
      this.state.storage.sql.exec(
        'INSERT OR REPLACE INTO threads (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)',
        id, title, now, now
      )
      return json({ id, title })
    }

    // Messages
    if (url.pathname === '/db/messages' && request.method === 'POST') {
      const { thread_id } = await request.json() as any
      return json([...this.state.storage.sql.exec(
        'SELECT role, content, created_at FROM messages WHERE thread_id = ? ORDER BY created_at ASC',
        thread_id
      )])
    }
    if (url.pathname === '/db/save-message' && request.method === 'POST') {
      const { thread_id, role, content } = await request.json() as any
      const now = Math.floor(Date.now() / 1000)
      this.state.storage.sql.exec(
        'INSERT INTO messages (thread_id, role, content, created_at) VALUES (?, ?, ?, ?)',
        thread_id, role, content, now
      )
      this.state.storage.sql.exec('UPDATE threads SET updated_at = ? WHERE id = ?', now, thread_id)
      return json({ success: true })
    }

    // Flows
    if (url.pathname === '/db/flow' && request.method === 'POST') {
      const f = await request.json() as any
      const now = Math.floor(Date.now() / 1000)
      this.state.storage.sql.exec(
        `INSERT INTO flows (id, thread_id, state, target, payload_hash, mode, risk, confirm_required, log_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        f.id, f.thread_id, f.state, f.target, f.payload_hash,
        f.mode, f.risk, f.confirm_required ? 1 : 0, f.log_id, now, now
      )
      return json({ success: true })
    }
    if (url.pathname === '/db/flow' && request.method === 'GET') {
      const tid = url.searchParams.get('thread_id')
      const rows = tid
        ? [...this.state.storage.sql.exec('SELECT * FROM flows WHERE thread_id = ? ORDER BY updated_at DESC', tid)]
        : [...this.state.storage.sql.exec('SELECT * FROM flows ORDER BY updated_at DESC LIMIT 50')]
      return json(rows)
    }
    if (url.pathname === '/db/flow-update' && request.method === 'POST') {
      const { id, state, outcome, confirmed, confirmed_by } = await request.json() as any
      this.state.storage.sql.exec(
        'UPDATE flows SET state = ?, outcome = ?, confirmed = ?, confirmed_by = ?, updated_at = ? WHERE id = ?',
        state, outcome, confirmed ? 1 : 0, confirmed_by || null, Math.floor(Date.now() / 1000), id
      )
      return json({ success: true })
    }

    // Audit log
    if (url.pathname === '/db/audit' && request.method === 'POST') {
      const r = await request.json() as any
      this.state.storage.sql.exec(
        `INSERT INTO audit_log (log_id, flow_id, actor, role, action, step, target, mode, risk, payload_hash, outcome, reason, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        r.logId, r.flowId || null, r.actor, r.role, r.action, r.step,
        r.target, r.mode, r.risk, r.payloadHash, r.outcome, r.reason,
        Math.floor(Date.now() / 1000)
      )
      return json({ success: true })
    }
    if (url.pathname === '/db/audit' && request.method === 'GET') {
      return json([...this.state.storage.sql.exec('SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 100')])
    }

    // Project context
    if (url.pathname === '/db/context' && request.method === 'GET') {
      const rows = [...this.state.storage.sql.exec('SELECT key, value FROM project_context')]
      const ctx: Record<string, string> = {}
      rows.forEach((r: any) => { ctx[r.key] = r.value })
      return json(ctx)
    }
    if (url.pathname === '/db/context' && request.method === 'POST') {
      const updates = await request.json() as Record<string, string>
      const now = Date.now()
      for (const [key, value] of Object.entries(updates)) {
        this.state.storage.sql.exec(
          'INSERT OR REPLACE INTO project_context (key, value, updated_at) VALUES (?, ?, ?)',
          key, value, now
        )
      }
      return json({ success: true })
    }

    return new Response('Not found', { status: 404 })
  }
}

function json(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
}