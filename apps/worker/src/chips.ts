// @ts-nocheck
import type { Env } from "./types-env.js";
import { type ChipsResponse, type Mode, CHIP_GROUPS } from "@sovereign/core";

export async function handleChips(req: Request, _env: Env): Promise<Response> {
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") || "self") as Mode;

  const groups = CHIP_GROUPS[mode] ?? CHIP_GROUPS.self;
  const payload: ChipsResponse = {
    mode,
    groups
  };

  return Response.json(payload, {
    headers: { "cache-control": "public, max-age=300" }
  });
}

export function registerChipsRoute(router: any, getEnv: () => Env) {
  router.get("/api/chips", async (req: Request) => handleChips(req, getEnv()));
}
