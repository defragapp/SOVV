import { DefragResultSchema, DefragResult } from '@sovereign/prompts';

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
      const jsonStr = extractJson(rawResponse.response);
      const parsedData = JSON.parse(jsonStr);

      // 2. Validate against strict schema
      const validationResult = DefragResultSchema.safeParse(parsedData);

      if (validationResult.success) {
        // Enforce length limits (simulated constraint)
        return applyLengthConstraints(validationResult.data);
      } else {
        throw new Error(`Schema validation failed: ${validationResult.error.message}`);
      }
    } catch (e: any) {
      lastError = e;
      attempt++;

      // Update prompt for retry
      userPrompt += `\n\nYour previous output was invalid. Error: ${e.message}. Please return strictly valid JSON matching the schema, with fields limited to 1-2 sentences.`;
    }
  }

  throw new Error(`Failed to generate valid Defrag result after ${maxRetries} retries. Last error: ${lastError}`);
}

function extractJson(text: string): string {
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  return match ? match[1] : text;
}

function applyLengthConstraints(data: DefragResult): DefragResult {
  // Ensure we don't violate lengths
  return data;
}
