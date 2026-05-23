import type { Env } from "./types-env.js";
export type Plan = "free" | "pro";
export declare function getSessionId(req: Request): Promise<string>;
export declare function getPlan(env: Env, sid: string): Promise<Plan>;
export declare function setPlan(env: Env, sid: string, plan: Plan): Promise<void>;
export declare function cookieHeader(sid: string): string;
//# sourceMappingURL=plan.d.ts.map