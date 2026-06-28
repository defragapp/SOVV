/**
 * featureFlags.ts
 *
 * Runtime feature flags for sovereign.os worker.
 * All flags default to false — enable via Cloudflare Worker env vars.
 *
 * To enable in production:
 *   wrangler secret put ENABLE_NEW_FLOW
 *   (set value to "true")
 *
 * To disable instantly (rollback):
 *   wrangler secret put ENABLE_NEW_FLOW
 *   (set value to "false")
 */

import type { Env } from "./types-env.js"

export interface FeatureFlags {
  enableNewFlow: boolean      // output-validator + memory + flow modules
  enableMemory: boolean       // pattern memory loop
  enableFlowSuggestion: boolean  // Defrag → Alignment/Covenant chain
}

/**
 * Read feature flags from Worker env.
 * All flags default to false for safety.
 */
export function getFeatureFlags(env: Env): FeatureFlags {
  return {
    enableNewFlow: env.ENABLE_NEW_FLOW === "true",
    enableMemory: env.ENABLE_MEMORY === "true",
    enableFlowSuggestion: env.ENABLE_FLOW_SUGGESTION === "true",
  }
}
