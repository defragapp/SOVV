// @ts-nocheck
/**
 * flow.ts
 *
 * Task 5: Flow orchestration — Defrag → Alignment chain
 *
 * After Defrag produces output, we can suggest Alignment
 * and pass structured context forward — no re-prompting raw input.
 *
 * This creates the guided flow:
 * Defrag (what is happening) → Alignment (how to respond)
 */

export interface FlowSuggestion {
  nextSpace: "ALIGNMENT" | "COVENANT" | null
  reason: string
  prefillContext: string  // structured context to pass to next space
  urgency: "low" | "medium" | "high"
}

/**
 * Analyze Defrag output and suggest next space.
 * Returns null if no clear next step is indicated.
 */
export function suggestNextSpace(
  defragOutput: Record<string, unknown>
): FlowSuggestion | null {
  const pattern = (defragOutput.activePattern as string || "").toLowerCase()
  const role = (defragOutput.oldRole as string || "").toLowerCase()
  const alignment = defragOutput.alignment as string || ""

  // High urgency — response needed soon
  const responsePatterns = [
    "conflict", "confrontation", "message", "conversation",
    "response", "reply", "boundary", "confronting",
  ]
  const needsResponse = responsePatterns.some(p => pattern.includes(p) || role.includes(p))

  if (needsResponse) {
    return {
      nextSpace: "ALIGNMENT",
      reason: "A response is forming. Alignment can help you move in a way that stays true.",
      prefillContext: buildAlignmentContext(defragOutput),
      urgency: "high",
    }
  }

  // Meaning-oriented — Covenant may help
  const meaningPatterns = [
    "grief", "loss", "purpose", "meaning", "faith",
    "calling", "story", "larger", "arc",
  ]
  const needsMeaning = meaningPatterns.some(p => pattern.includes(p) || role.includes(p))

  if (needsMeaning) {
    return {
      nextSpace: "COVENANT",
      reason: "This moment may connect to a larger pattern. Covenant can help you hold it.",
      prefillContext: buildCovenantContext(defragOutput),
      urgency: "low",
    }
  }

  // Default — suggest Alignment if there's a clear shift
  if (alignment && alignment.length > 20) {
    return {
      nextSpace: "ALIGNMENT",
      reason: "Defrag has shown what is active. Alignment can help you respond cleanly.",
      prefillContext: buildAlignmentContext(defragOutput),
      urgency: "medium",
    }
  }

  return null
}

/**
 * Build structured context for Alignment from Defrag output.
 * PRIVACY: Only structured pattern data — never raw user input.
 */
function buildAlignmentContext(defragOutput: Record<string, unknown>): string {
  const parts: string[] = []

  if (defragOutput.activePattern) {
    parts.push(`Active pattern: ${defragOutput.activePattern}`)
  }
  if (defragOutput.oldRole) {
    parts.push(`Role entering: ${defragOutput.oldRole}`)
  }
  if (defragOutput.strainPattern) {
    parts.push(`Pressure: ${defragOutput.strainPattern}`)
  }
  if (defragOutput.alignment) {
    parts.push(`What gives this moment a better chance: ${defragOutput.alignment}`)
  }

  return parts.join("\n")
}

/**
 * Build structured context for Covenant from Defrag output.
 */
function buildCovenantContext(defragOutput: Record<string, unknown>): string {
  const parts: string[] = []

  if (defragOutput.activePattern) {
    parts.push(`Pattern: ${defragOutput.activePattern}`)
  }
  if (defragOutput.theRepeat) {
    parts.push(`What keeps happening: ${defragOutput.theRepeat}`)
  }
  if (defragOutput.giftUnderStrain) {
    parts.push(`What is working: ${defragOutput.giftUnderStrain}`)
  }

  return parts.join("\n")
}

/**
 * Format flow suggestion for API response.
 * Included in Defrag output when a next space is suggested.
 */
export function formatFlowSuggestion(suggestion: FlowSuggestion | null): Record<string, unknown> | null {
  if (!suggestion) return null

  return {
    nextSpace: suggestion.nextSpace,
    reason: suggestion.reason,
    urgency: suggestion.urgency,
    // prefillContext is NOT sent to client — it's used server-side when user navigates
    hasPrefill: suggestion.prefillContext.length > 0,
  }
}
