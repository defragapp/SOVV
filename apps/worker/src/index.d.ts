import type { ExecutionContext, MessageBatch } from "@cloudflare/workers-types";
import type { Env } from "./types-env.js";
declare const _default: {
    fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
    queue(batch: MessageBatch<{
        sessionId: string;
        interactionId: string;
    }>, env: Env): Promise<void>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map