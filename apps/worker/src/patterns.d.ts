import type { D1Database, Ai } from "@cloudflare/workers-types";
import type { Env } from "./types-env.js";
export declare function extractPatterns(env: {
    DB: D1Database;
    AI: Ai;
    AI_MODEL?: string;
}, sessionId: string, newInteractionId: string): Promise<void>;
export declare function handlePatternVerify(req: Request, env: Env): Promise<Response>;
export declare function handleGetPatterns(req: Request, env: Env): Promise<Response>;
//# sourceMappingURL=patterns.d.ts.map