// lib/alignment/getAlignmentBrief.ts
// Fetches the personalized AlignmentBrief for the entry page.
// Called once on mount — uses the user's actual Baseline Design via the worker.

export interface AlignmentTagGlossaryItem {
  tag: string
  label: string
}

export interface AlignmentTraitBlock {
  key: string
  lines: string[]
  tags: string[]
  tagGlossary?: AlignmentTagGlossaryItem[]
}

export interface AlignmentBrief {
  hero: {
    anchor: string
    tags: string[]
    tagGlossary?: AlignmentTagGlossaryItem[]
  }
  aligned: AlignmentTraitBlock[]
  misaligned: {
    over: AlignmentTraitBlock[]
    under: AlignmentTraitBlock[]
  }
  currentDrift?: string[]
  action: string[]
  workspaceHref: string
}

export async function getAlignmentBrief(
  recentPatterns?: string[]
): Promise<AlignmentBrief | null> {
  try {
    const res = await fetch("/api/alignment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        mode: "entry",
        context: recentPatterns?.length ? { recent_patterns: recentPatterns } : undefined,
      }),
    })

    if (!res.ok) return null
    const data = await res.json() as AlignmentBrief
    if (!data?.hero?.anchor) return null
    return data
  } catch {
    return null
  }
}
