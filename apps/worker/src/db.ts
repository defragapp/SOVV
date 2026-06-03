export interface Interaction {
  id?: number;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
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
 * Upserts pattern findings. Uses ON CONFLICT to update existing patterns for a session.
 */
export async function upsertPattern(db: D1Database, pattern: Pattern) {
  return await db.prepare(
    "INSERT INTO patterns (session_id, key, value, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(session_id, key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP"
  ).bind(pattern.session_id, pattern.key, pattern.value).run();
}