// @ts-nocheck
/**
 * memory.ts
 *
 * Task 4: Memory loop — Save → reuse patterns
 *
 * When a user saves a result, we extract and store the pattern signature.
 * On the next session, we surface related past patterns as context.
 *
 * Storage: KV with user-scoped keys
 * Privacy: Only pattern metadata stored — never raw user input
 */

import type { Env } from "./types-env.js"

export interface PatternMemory {
  id: string
  userId: string
  space: "DEFRAG" | "ALIGNMENT" | "COVENANT"
  pattern: string          // activePattern or equivalent
  role?: string            // oldRole (Defrag)
  pressure?: string        // strainPattern (Defrag)
  shift?: string           // alignment / theShift
  timestamp: string
  sessionCount: number     // how many times this pattern has appeared
}

export interface MemoryContext {
  recentPatterns: PatternMemory[]
  recurringPattern?: string   // most frequent pattern
  sessionCount: number
}

const MEMORY_KEY = (userId: string) => `memory:patterns:${userId}`
const MEMORY_TTL = 90 * 24 * 60 * 60  // 90 days

/**
 * Extract pattern signature from AI output.
 * PRIVACY: Only extracts structured pattern data — never raw user input.
 */
export function extractPatternSignature(
  output: Record<string, unknown>,
  space: "DEFRAG" | "ALIGNMENT" | "COVENANT"
): Omit<PatternMemory, "id" | "userId" | "timestamp" | "sessionCount"> | null {
  if (space === "DEFRAG") {
    const pattern = output.activePattern as string
    if (!pattern) return null
    return {
      space,
      pattern,
      role: output.oldRole as string | undefined,
      pressure: output.strainPattern as string | undefined,
      shift: output.alignment as string | undefined,
    }
  }

  if (space === "ALIGNMENT") {
    const shift = output.theShift as string
    if (!shift) return null
    return {
      space,
      pattern: output.whatIsTrue as string || shift,
      shift,
    }
  }

  if (space === "COVENANT") {
    const pattern = output.pattern as string
    if (!pattern) return null
    return {
      space,
      pattern,
      shift: output.nextStep as string | undefined,
    }
  }

  return null
}

/**
 * Save a pattern to memory after user saves a result.
 * Called from history.ts when workspace_source is set.
 */
export async function savePatternMemory(
  env: Env,
  userId: string,
  output: Record<string, unknown>,
  space: "DEFRAG" | "ALIGNMENT" | "COVENANT"
): Promise<void> {
  if (!env.KV) return

  const signature = extractPatternSignature(output, space)
  if (!signature) return

  try {
    const existing = await env.KV.get(MEMORY_KEY(userId))
    const memories: PatternMemory[] = existing ? JSON.parse(existing) : []

    // Check if this pattern already exists
    const existingIdx = memories.findIndex(m =>
      m.space === space && m.pattern.toLowerCase() === signature.pattern.toLowerCase()
    )

    if (existingIdx >= 0) {
      // Increment session count for recurring pattern
      memories[existingIdx].sessionCount++
      memories[existingIdx].timestamp = new Date().toISOString()
    } else {
      // Add new pattern memory
      const newMemory: PatternMemory = {
        id: crypto.randomUUID(),
        userId,
        ...signature,
        timestamp: new Date().toISOString(),
        sessionCount: 1,
      }
      memories.unshift(newMemory)
    }

    // Keep only last 20 patterns
    const trimmed = memories.slice(0, 20)
    await env.KV.put(MEMORY_KEY(userId), JSON.stringify(trimmed), { expirationTtl: MEMORY_TTL })
  } catch (err) {
    console.error("savePatternMemory error:", String(err))
  }
}

/**
 * Load memory context for a user session.
 * Returns recent patterns and recurring pattern if present.
 */
export async function loadMemoryContext(
  env: Env,
  userId: string,
  space?: "DEFRAG" | "ALIGNMENT" | "COVENANT"
): Promise<MemoryContext> {
  if (!env.KV) return { recentPatterns: [], sessionCount: 0 }

  try {
    const existing = await env.KV.get(MEMORY_KEY(userId))
    if (!existing) return { recentPatterns: [], sessionCount: 0 }

    const memories: PatternMemory[] = JSON.parse(existing)

    // Filter by space if specified
    const filtered = space ? memories.filter(m => m.space === space) : memories

    // Find recurring pattern (sessionCount > 1)
    const recurring = filtered
      .filter(m => m.sessionCount > 1)
      .sort((a, b) => b.sessionCount - a.sessionCount)[0]

    return {
      recentPatterns: filtered.slice(0, 5),
      recurringPattern: recurring?.pattern,
      sessionCount: filtered.reduce((sum, m) => sum + m.sessionCount, 0),
    }
  } catch {
    return { recentPatterns: [], sessionCount: 0 }
  }
}

/**
 * Format memory context for injection into AI prompt.
 * PRIVACY: Only pattern metadata — never raw user input.
 */
export function formatMemoryForPrompt(context: MemoryContext): string {
  if (context.recentPatterns.length === 0) return ""

  const lines: string[] = ["PATTERN HISTORY (use for continuity — do not reference directly):"]

  if (context.recurringPattern) {
    lines.push(`Recurring pattern: ${context.recurringPattern} (appeared ${context.sessionCount} times)`)
  }

  const recent = context.recentPatterns.slice(0, 3)
  if (recent.length > 0) {
    lines.push("Recent patterns:")
    for (const m of recent) {
      lines.push(`- ${m.pattern}${m.role ? ` (role: ${m.role})` : ""}`)
    }
  }

  return lines.join("\n")
}
