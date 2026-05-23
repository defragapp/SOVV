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
    verified: number;
}
export declare function mapInteraction(row: InteractionRow): CoreInteraction;
export declare function mapPattern(row: PatternRow): CorePattern;
/** Insert an interaction record */
export declare function insertInteraction(db: D1Database, data: Omit<CoreInteraction, "created_at">): Promise<void>;
/** Get recent interactions for a session (for pattern extraction) */
export declare function getRecentInteractions(db: D1Database, sessionId: string, limit?: number): Promise<CoreInteraction[]>;
/** Get active patterns for a session (for context injection) */
export declare function getPatterns(db: D1Database, sessionId: string): Promise<CorePattern[]>;
/** Upsert a pattern: increment count if similar content exists, otherwise insert */
export declare function upsertPattern(db: D1Database, data: Omit<CorePattern, "occurrence_count" | "first_seen" | "last_seen">): Promise<void>;
/** Format patterns for injection into AI prompt */
export declare function formatPatternsForPrompt(patterns: CorePattern[]): string;
//# sourceMappingURL=db.d.ts.map