/**
 * streamText.ts
 *
 * Lightweight word-by-word streaming for primary output text.
 * No server dependency — purely client-side progressive rendering.
 *
 * Usage:
 *   await streamText(text, (chunk) => setDisplayed(chunk))
 */
export async function streamText(
  text: string,
  onChunk: (chunk: string) => void,
  delayMs = 18
): Promise<void> {
  const words = text.split(' ')
  for (let i = 0; i < words.length; i++) {
    await new Promise<void>(r => setTimeout(r, delayMs))
    onChunk(words.slice(0, i + 1).join(' '))
  }
}
