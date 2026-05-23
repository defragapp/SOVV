import type { Env } from "./types-env.js";
import type { Baseline, BaselineRequest } from "@sovereign/core";
export declare function getBaseline(env: Env, sid: string): Promise<Baseline | null>;
export declare function formatBaseline(baseline: Baseline): string;
export declare function saveBaseline(env: Env, sid: string, baseline: BaselineRequest): Promise<Baseline>;
export declare function handleGetBaseline(req: Request, env: Env): Promise<Response>;
export declare function handleSaveBaseline(req: Request, env: Env): Promise<Response>;
//# sourceMappingURL=baseline.d.ts.map