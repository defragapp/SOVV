/**
 * story-engine.ts
 *
 * Triggers the Story Engine for a pattern that has recurred enough times
 * to warrant narrative synthesis (occurrence_count > 3).
 *
 * Pipeline:
 *   1. Query pattern from D1 (patterns table: id, session_id, key, value)
 *   2. Check if pattern has recurred (value contains occurrence metadata)
 *   3. Call external Story Engine API with exponential backoff
 *   4. Store resulting media URL in library item payload
 *
 * NOTE: The patterns table stores key/value pairs per session.
 * Occurrence counting is done via the value field (JSON) or by counting
 * rows with the same key across sessions for a user.
 */

import type { Env } from "../types-env.js"

const MIN_OCCURRENCES = 3

/**
 * Trigger the Story Engine for a recurring pattern.
 * Called after pattern extraction when a pattern has been seen enough times.
 */
export async function triggerStoryEngine(
  patternKey: string,
  userId: string,
  env: Env
): Promise<void> {
  const db = env.DB

  // 1. Count how many sessions this pattern key has appeared in for this user
  const countResult = await db
    .prepare(
      `SELECT COUNT(DISTINCT p.session_id) as occurrence_count
       FROM patterns p
       JOIN sessions s ON p.session_id = s.user_id
       WHERE p.key = ? AND s.user_id = ?`
    )
    .bind(patternKey, userId)
    .first<{ occurrence_count: number }>()

  const occurrenceCount = countResult?.occurrence_count ?? 0

  if (occurrenceCount <= MIN_OCCURRENCES) {
    console.log(
      `[StoryEngine] Pattern "${patternKey}" has ${occurrenceCount} occurrences — below threshold of ${MIN_OCCURRENCES}. Skipping.`
    )
    return
  }

  // 2. Get the most recent pattern value for context
  const pattern = await db
    .prepare(
      `SELECT p.id, p.key, p.value, p.session_id
       FROM patterns p
       JOIN sessions s ON p.session_id = s.user_id
       WHERE p.key = ? AND s.user_id = ?
       ORDER BY p.updated_at DESC LIMIT 1`
    )
    .bind(patternKey, userId)
    .first<{ id: string; key: string; value: string; session_id: string }>()

  if (!pattern) {
    console.error(`[StoryEngine] Pattern "${patternKey}" not found for user ${userId}`)
    return
  }

  // 3. Check Story Engine API credentials
  const apiUrl = (env as any).STORY_ENGINE_API_URL as string | undefined
  const apiKey = (env as any).STORY_ENGINE_API_KEY as string | undefined

  if (!apiUrl || !apiKey) {
    console.warn("[StoryEngine] STORY_ENGINE_API_URL or STORY_ENGINE_API_KEY not configured — skipping")
    return
  }

  // 4. Call Story Engine API with exponential backoff
  let mediaUrl: string | null = null
  const maxRetries = 5

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${apiUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          patternKey,
          patternValue: pattern.value,
          occurrenceCount,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Story Engine API responded with ${response.status}`)
      }

      const result = await response.json() as { mediaUrl?: string }
      mediaUrl = result.mediaUrl ?? null
      break
    } catch (error) {
      if (attempt >= maxRetries) {
        console.error(`[StoryEngine] Failed after ${maxRetries} attempts:`, error)
        throw error
      }
      const delay = Math.pow(2, attempt) * 1000
      console.warn(`[StoryEngine] Attempt ${attempt} failed. Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // 5. Store media URL in the library item payload for this user's most recent save
  if (mediaUrl) {
    await db
      .prepare(
        `UPDATE library
         SET payload = json_patch(COALESCE(payload, '{}'), json_object('storyMediaUrl', ?))
         WHERE user_id = ? AND workspace_source = 'DEFRAG'
         ORDER BY created_at DESC LIMIT 1`
      )
      .bind(mediaUrl, userId)
      .run()

    console.log(`[StoryEngine] Updated library item for user ${userId} with media URL`)
  }
}
