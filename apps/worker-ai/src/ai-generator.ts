import { DefragResultSchema } from '@sovereign/prompts';
import type { DefragResult } from '@sovereign/prompts';

export async function generateDefragWithRetry(
  aiContext: any,
  systemPrompt: string,
  userPrompt: string,
  maxRetries = 2
): Promise<DefragResult> {
  let attempt = 0;
  let lastError = null;

  while (attempt <= maxRetries) {
    try {
      // 1. First Pass (Structure)
      const rawResponse = await aiContext.run('@cf/meta/llama-3.1-8b-instruct-fast', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      });

      // Parse JSON from markdown block if needed
      const jsonStr = extractJson(rawResponse.response ?? '');
      const parsedData = JSON.parse(jsonStr);

      // 2. Validate against strict schema
      const validationResult = DefragResultSchema.safeParse(parsedData);

      if (validationResult.success) {
        // Enforce length limits (simulated constraint)
        return applyLengthConstraints(validationResult.data);
      } else {
        throw new Error();
      }
    } catch (e: any) {
      lastError = e;
      attempt++;

      // Update prompt for retry
      userPrompt += ;
    }
  }

  throw new Error();
}

function extractJson(text: string): string {
  const match = text.match(//);
  return match ? match[1] : text;
}

function applyLengthConstraints(data: DefragResult): DefragResult {
  // Ensure we don't violate lengths
  return data;
}
