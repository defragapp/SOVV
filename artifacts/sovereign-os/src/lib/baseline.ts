// Baseline translation utilities — stub for Vite migration
// The real implementation runs server-side via the API

export interface BaselineEntry {
  label: string;
  chips: Array<{ text: string; chips: string[] }>;
}

export interface DefragEntryTranslation {
  hero: { lines: string[]; tags?: string[]; glossary?: Array<{ tag: string; label: string }> };
  activePattern?: { name?: string; lines: string[]; tags?: string[] };
  pressureMap?: { starts?: string[]; moves?: string[]; lands?: string[] };
  loopPreview?: { trigger?: string; reaction?: string; repeat?: string; cost?: string };
  rolePull?: { lines: string[] };
  cleanerMove?: { lines: string[] };
  workspaceHref: string;
  likelyLoops?: Array<{ key: string; label: string; description: string; trigger: string; tags?: string[] }>;
  pressurePattern?: { lines: string[]; tags?: string[] };
  repairMoves?: string[];
}

/**
 * Client-side stub — actual translation happens in the API response.
 * Components that call getTranslation should use API data directly.
 */
export function getTranslation(data: unknown): DefragEntryTranslation {
  const d = data as Record<string, unknown>;
  return {
    hero: { lines: [d?.summary as string || 'Processing your moment…'] },
    workspaceHref: '/apps/defrag/workspace',
  };
}
