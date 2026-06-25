import { D1Database } from '@cloudflare/workers-types';

export async function triggerStoryEngine(patternId: string, db: D1Database, env: { STORY_ENGINE_API_URL: string; STORY_ENGINE_API_KEY: string }) {
  // 1. Query the pattern data from D1
  const pattern = await db.prepare("SELECT * FROM patterns WHERE id = ?")
    .bind(patternId)
    .first<{ occurrence_count: number }>();

  if (!pattern) {
    console.error(`Pattern ${patternId} not found`);
    return;
  }

  // 2. Check occurrence_count > 3
  if (pattern.occurrence_count <= 3) {
    console.log(`Pattern ${patternId} occurrence count (${pattern.occurrence_count}) is not greater than 3. Skipping.`);
    return;
  }

  // 3. Wrap external API calls (to Story Engine) in a try/catch with exponential backoff retry logic
  let mediaUrl: string | null = null;
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(`${env.STORY_ENGINE_API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.STORY_ENGINE_API_KEY}`
        },
        body: JSON.stringify({ patternId, data: pattern })
      });

      if (!response.ok) {
        throw new Error(`Story Engine API failed with status ${response.status}`);
      }

      const result = await response.json() as { mediaUrl: string };
      mediaUrl = result.mediaUrl;
      break; // Success
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        console.error(`Failed to trigger Story Engine after ${maxRetries} attempts:`, error);
        throw error;
      }
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // 4. Update the corresponding LibraryItem in D1 with the resulting media URL once complete
  if (mediaUrl) {
    await db.prepare("UPDATE library SET media_url = ?, updated_at = CURRENT_TIMESTAMP WHERE pattern_id = ?")
      .bind(mediaUrl, patternId)
      .run();
    console.log(`Successfully updated LibraryItem for pattern ${patternId} with media URL: ${mediaUrl}`);
  }
}
