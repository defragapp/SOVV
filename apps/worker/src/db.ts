// @ts-nocheck
export interface Interaction {
  id?: number;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface InteractionRow {
  id: string;
  session_id: string;
  mode?: string;
  question?: string;
  text?: string;
  people?: string;
  result?: string;
  confidence?: string;
  created_at: string;
}

export interface Pattern {
  session_id: string;
  key: string;
  value: string;
  updated_at?: string;
}

/**
 * Logs a new interaction to the D1 database.
 */
export async function saveInteraction(db: D1Database, interaction: Interaction) {
  return await db.prepare(
    "INSERT INTO interactions (session_id, role, content) VALUES (?, ?, ?)"
  ).bind(interaction.session_id, interaction.role, interaction.content).run();
}

/**
 * Retrieves all identified patterns for a specific session to be used as context.
 */
export async function getPatterns(db: D1Database, session_id: string): Promise<Pattern[]> {
  const { results } = await db.prepare(
    "SELECT * FROM patterns WHERE session_id = ?"
  ).bind(session_id).all<Pattern>();
  return results || [];
}

/**
 * Upserts pattern findings in batch. Uses ON CONFLICT to update existing patterns for a session.
 */
export async function upsertPatterns(db: D1Database, patterns: Array<{
  id: string;
  session_id: string;
  pattern_type: string;
  content: string;
  source_interaction_ids: string[];
  confidence: string;
  verified: number;
}>) {
  if (patterns.length === 0) return [];
  const stmt = db.prepare(
    "INSERT INTO patterns (id, session_id, key, value, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(session_id, key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP"
  );
  return await db.batch(patterns.map(pattern =>
    stmt.bind(pattern.id, pattern.session_id, pattern.pattern_type, pattern.content)
  ));
}

/**
 * Formats patterns array into a prompt-friendly string.
 */
export function formatPatternsForPrompt(patterns: Pattern[]): string {
  if (!patterns.length) return "";
  return "Identified patterns:\n" + patterns
    .map(p => `- ${p.key}: ${p.value}`)
    .join("\n");
}

/**
 * Inserts a new explain interaction record.
 */
export async function insertInteraction(
  db: D1Database,
  interaction: {
    id: string;
    session_id: string;
    mode: string;
    question: string;
    text: string;
    people: Array<{ id: string; relation: string; name: string }>;
    result: Record<string, unknown>;
    confidence: string;
  }
) {
  return await db.prepare(
    "INSERT INTO interactions (id, session_id, mode, question, text, people, result, confidence, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))"
  ).bind(
    interaction.id,
    interaction.session_id,
    interaction.mode,
    interaction.question,
    interaction.text,
    JSON.stringify(interaction.people),
    JSON.stringify(interaction.result),
    interaction.confidence
  ).run();
}

/**
 * Maps a raw D1 row to an Interaction type.
 */
export function mapInteraction(row: InteractionRow) {
  return {
    id: row.id,
    session_id: row.session_id,
    mode: row.mode,
    question: row.question,
    text: row.text,
    people: row.people ? JSON.parse(row.people) : [],
    result: row.result ? JSON.parse(row.result) : {},
    confidence: row.confidence,
    created_at: row.created_at,
  };
}

/**
 * Retrieves recent interactions for pattern extraction.
 */
export async function getRecentInteractions(
  db: D1Database,
  session_id: string,
  limit: number
): Promise<any[]> {
  const { results } = await db.prepare(
    "SELECT * FROM interactions WHERE session_id = ? ORDER BY created_at DESC LIMIT ?"
  ).bind(session_id, limit).all();
  return results ?? [];
}

/**
 * Creates a support ticket record from an incoming email.
 */
export async function insertSupportTicket(
  db: D1Database,
  ticket: { id: string; sender: string; recipient: string; subject: string; body_preview: string }
) {
  return await db.prepare(
    "INSERT INTO support_tickets (id, sender, recipient, subject, body_preview, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))"
  ).bind(ticket.id, ticket.sender, ticket.recipient, ticket.subject, ticket.body_preview).run();
}
