// ─── Relational Memory Layer: D1 Helpers ───

import type { D1Database } from "@cloudflare/workers-types";
import type { Interaction as CoreInteraction, Pattern as CorePattern } from "@sovereign/core";

export interface InteractionRow {
  id: string;
  session_id: string;
  mode: string;
  question: string;
  text: string;
  people: string;
  result: string;
  confidence: string;
  created_at: number;
}

export interface PatternRow {
  id: string;
  session_id: string;
  pattern_type: string;
  content: string;
  source_interaction_ids: string;
  confidence: string;
  occurrence_count: number;
  first_seen: number;
  last_seen: number;
}

export function mapInteraction(row: InteractionRow): CoreInteraction {
  return {
    ...row,
    mode: row.mode as any,
    people: JSON.parse(row.people || "[]"),
    result: JSON.parse(row.result || "{}"),
    confidence: row.confidence as any,
  };
}

export function mapPattern(row: PatternRow): CorePattern {
  return {
    ...row,
    pattern_type: row.pattern_type as any,
    source_interaction_ids: JSON.parse(row.source_interaction_ids || "[]"),
    confidence: row.confidence as any,
  };
}

/** Insert an interaction record */
export async function insertInteraction(
  db: D1Database,
  data: Omit<CoreInteraction, "created_at">
) {
  await db
    .prepare(
      `INSERT INTO interactions (id, session_id, mode, question, text, people, result, confidence, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      data.id,
      data.session_id,
      data.mode,
      data.question,
      data.text,
      JSON.stringify(data.people),
      JSON.stringify(data.result),
      String(data.confidence),
      Date.now()
    )
    .run();
}

/** Get recent interactions for a session (for pattern extraction) */
export async function getRecentInteractions(
  db: D1Database,
  sessionId: string,
  limit = 20
): Promise<CoreInteraction[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM interactions WHERE session_id = ? ORDER BY created_at DESC LIMIT ?`
    )
    .bind(sessionId, limit)
    .all<InteractionRow>();
  return (results ?? []).map(mapInteraction);
}

/** Get active patterns for a session (for context injection) */
export async function getPatterns(
  db: D1Database,
  sessionId: string
): Promise<CorePattern[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM patterns WHERE session_id = ? AND occurrence_count >= 1 ORDER BY last_seen DESC LIMIT 10`
    )
    .bind(sessionId)
    .all<PatternRow>();
  return (results ?? []).map(mapPattern);
}

/** Upsert a pattern: increment count if similar content exists, otherwise insert */
export async function upsertPattern(db: D1Database, data: Omit<CorePattern, "occurrence_count" | "first_seen" | "last_seen">) {
  // Check for existing similar pattern
  const existing = await db
    .prepare(
      `SELECT id, occurrence_count, source_interaction_ids FROM patterns WHERE session_id = ? AND pattern_type = ? AND content = ?`
    )
    .bind(data.session_id, data.pattern_type, data.content)
    .first<{ id: string; occurrence_count: number; source_interaction_ids: string }>();

  const now = Date.now();

  if (existing) {
    // Merge source IDs and increment count
    const existingSources: string[] = JSON.parse(existing.source_interaction_ids || "[]");
    const merged = [...new Set([...existingSources, ...data.source_interaction_ids])];
    await db
      .prepare(
        `UPDATE patterns SET occurrence_count = ?, source_interaction_ids = ?, last_seen = ? WHERE id = ?`
      )
      .bind(existing.occurrence_count + 1, JSON.stringify(merged), now, existing.id)
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO patterns (id, session_id, pattern_type, content, source_interaction_ids, confidence, occurrence_count, first_seen, last_seen)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`
      )
      .bind(
        data.id,
        data.session_id,
        data.pattern_type,
        data.content,
        JSON.stringify(data.source_interaction_ids),
        String(data.confidence),
        now,
        now
      )
      .run();
  }
}

/** Format patterns for injection into AI prompt */
export function formatPatternsForPrompt(patterns: CorePattern[]): string {
  if (!patterns.length) return "";
  const lines = patterns.map(
    (p) => `- [${p.pattern_type}, seen ${p.occurrence_count}x] ${p.content}`
  );
  return `Known patterns about this user:\n${lines.join("\n")}\n\nUse these patterns to deepen the explanation. Do not repeat them verbatim — weave them in naturally if relevant.`;
}
