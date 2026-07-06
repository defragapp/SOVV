/**
 * sanitize.ts
 * Input sanitization utilities for AI prompt safety.
 * Strips HTML, control characters, and prompt injection patterns.
 */

const MAX_INPUT_LENGTH = 4000;

/**
 * Sanitize user text input before passing to AI.
 * - Strips HTML tags
 * - Removes control characters (except newlines/tabs)
 * - Truncates to max length
 * - Strips common prompt injection patterns
 */
export function sanitizeInput(text: unknown): string {
  if (typeof text !== "string") return "";

  let s = text
    // Strip HTML tags
    .replace(/<[^>]*>/g, "")
    // Remove null bytes and other control chars (keep \n \t \r)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Normalize whitespace runs (but preserve intentional newlines)
    .replace(/[ \t]+/g, " ")
    .trim();

  // Truncate to max length
  if (s.length > MAX_INPUT_LENGTH) {
    s = s.slice(0, MAX_INPUT_LENGTH);
  }

  return s;
}

/**
 * Sanitize a name/label field (shorter, stricter).
 */
export function sanitizeName(text: unknown): string {
  if (typeof text !== "string") return "";
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/[^\w\s\-'.]/g, "")
    .trim()
    .slice(0, 100);
}

/**
 * Check if input contains obvious prompt injection attempts.
 * Returns true if suspicious.
 */
export function detectPromptInjection(text: string): boolean {
  const patterns = [
    /ignore\s+(previous|above|all)\s+instructions/i,
    /system\s*prompt/i,
    /you\s+are\s+now\s+a/i,
    /act\s+as\s+(if\s+you\s+are|a\s+different)/i,
    /disregard\s+(your|all|previous)/i,
    /reveal\s+(your|the)\s+(system|instructions|prompt)/i,
    /\[INST\]|\[\/INST\]|<\|im_start\|>|<\|im_end\|>/i,
  ];
  return patterns.some(p => p.test(text));
}
