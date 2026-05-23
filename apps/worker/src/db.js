// ─── Relational Memory Layer: D1 Helpers ───
export function mapInteraction(row) {
    return {
        ...row,
        mode: row.mode,
        people: JSON.parse(row.people || "[]"),
        result: JSON.parse(row.result || "{}"),
        confidence: row.confidence,
    };
}
export function mapPattern(row) {
    return {
        ...row,
        pattern_type: row.pattern_type,
        source_interaction_ids: JSON.parse(row.source_interaction_ids || "[]"),
        confidence: row.confidence,
    };
}
/** Insert an interaction record */
export async function insertInteraction(db, data) {
    await db
        .prepare(`INSERT INTO interactions (id, session_id, mode, question, text, people, result, confidence, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(data.id, data.session_id, data.mode, data.question, data.text, JSON.stringify(data.people), JSON.stringify(data.result), String(data.confidence), Date.now())
        .run();
}
/** Get recent interactions for a session (for pattern extraction) */
export async function getRecentInteractions(db, sessionId, limit = 20) {
    const { results } = await db
        .prepare(`SELECT * FROM interactions WHERE session_id = ? ORDER BY created_at DESC LIMIT ?`)
        .bind(sessionId, limit)
        .all();
    return (results ?? []).map(mapInteraction);
}
/** Get active patterns for a session (for context injection) */
export async function getPatterns(db, sessionId) {
    const { results } = await db
        .prepare(`SELECT * FROM patterns WHERE session_id = ? AND occurrence_count >= 1 ORDER BY last_seen DESC LIMIT 10`)
        .bind(sessionId)
        .all();
    return (results ?? []).map(mapPattern);
}
/** Upsert a pattern: increment count if similar content exists, otherwise insert */
export async function upsertPattern(db, data) {
    // Check for existing similar pattern
    const existing = await db
        .prepare(`SELECT id, occurrence_count, source_interaction_ids FROM patterns WHERE session_id = ? AND pattern_type = ? AND content = ?`)
        .bind(data.session_id, data.pattern_type, data.content)
        .first();
    const now = Date.now();
    if (existing) {
        // Merge source IDs and increment count
        const existingSources = JSON.parse(existing.source_interaction_ids || "[]");
        const merged = [...new Set([...existingSources, ...data.source_interaction_ids])];
        await db
            .prepare(`UPDATE patterns SET occurrence_count = ?, source_interaction_ids = ?, last_seen = ? WHERE id = ?`)
            .bind(existing.occurrence_count + 1, JSON.stringify(merged), now, existing.id)
            .run();
    }
    else {
        await db
            .prepare(`INSERT INTO patterns (id, session_id, pattern_type, content, source_interaction_ids, confidence, occurrence_count, first_seen, last_seen, verified)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`)
            .bind(data.id, data.session_id, data.pattern_type, data.content, JSON.stringify(data.source_interaction_ids), String(data.confidence), now, now, data.verified ?? 0)
            .run();
    }
}
/** Format patterns for injection into AI prompt */
export function formatPatternsForPrompt(patterns) {
    if (!patterns.length)
        return "";
    const lines = patterns.map((p) => `- [${p.pattern_type}, seen ${p.occurrence_count}x] ${p.content}`);
    return `Known patterns about this user:\n${lines.join("\n")}\n\nUse these patterns to deepen the explanation. Do not repeat them verbatim — weave them in naturally if relevant.`;
}
//# sourceMappingURL=db.js.map