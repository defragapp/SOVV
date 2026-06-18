// lib/baseline/getTranslation.ts
// Fetches the HumanBehaviorTranslation for an app entry page.
// Cached 24h server-side. Pass refresh:true to force recompute.

export interface SourceEvidence {
  tag: string
  framework: string
  glossary: string
}

export interface HumanBehaviorTranslation {
  version: "translation.v1"
  status: "ready" | "failed" | "partial"
  computedAt: string
  userId: string
  app: "alignment" | "defrag" | "covenant"
  appRender: Record<string, unknown>
  sourceEvidence: SourceEvidence[]
}

export async function getTranslation(
  app: "alignment" | "defrag" | "covenant",
  options?: { refresh?: boolean }
): Promise<HumanBehaviorTranslation | null> {
  try {
    const res = await fetch("/api/baseline/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ app, refresh: options?.refresh }),
    })
    if (!res.ok) return null
    const data = await res.json() as HumanBehaviorTranslation
    if (!data?.appRender) return null
    return data
  } catch {
    return null
  }
}