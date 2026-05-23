/**
 * Sovereign OS Frontend API Client
 *
 * These requests are proxied through Next.js (apps/web/app/api/*)
 * to the Worker backend at api.defrag.app to preserve session cookies.
 */
export declare function explain(text: string, mode?: string): Promise<unknown>;
export declare function getPatterns(): Promise<unknown>;
export declare function verifyPattern(patternId: string, action: 'confirm' | 'dismiss'): Promise<unknown>;
//# sourceMappingURL=api.d.ts.map