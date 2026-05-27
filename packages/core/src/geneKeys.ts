// packages/core/src/geneKeys.ts

import { BaselineRecord } from "./types";

export interface GeneKeyProfile {
  lifeWork: number;
  evolution: number;
  radiance: number;
  purpose: number;
}

// Simple deterministic hash
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function toGeneKey(n: number): number {
  return (n % 64) + 1;
}

export function generateGeneKeys(
  baseline: BaselineRecord
): GeneKeyProfile {
  const seed = `${baseline.dob}|${baseline.tob}|${baseline.pob}`;
  const baseHash = hashString(seed);

  return {
    lifeWork: toGeneKey(baseHash),
    evolution: toGeneKey(baseHash >> 2),
    radiance: toGeneKey(baseHash >> 4),
    purpose: toGeneKey(baseHash >> 6),
  };
}
