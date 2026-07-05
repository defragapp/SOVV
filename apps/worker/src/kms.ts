/**
 * KMS — AES-256-GCM encryption service
 *
 * Provides key-wrapped AES-256-GCM encrypt/decrypt for Sovereign.os Covenant
 * pro-tier spaces.  All crypto is performed via the Web Crypto API so this
 * module works in Cloudflare Workers without any Node.js dependencies.
 *
 * Environment requirements:
 *   KMS_ENCRYPTION_KEY — 32-byte key material encoded as a 64-character
 *                         lowercase hex string.  Generate with:
 *                           openssl rand -hex 32
 *                         Set as a Cloudflare Worker secret:
 *                           wrangler secret put KMS_ENCRYPTION_KEY
 *
 * Security properties:
 *   - AES-256-GCM (authenticated encryption — provides both confidentiality
 *     and integrity / tamper detection).
 *   - A fresh 12-byte IV is generated for every encrypt call.
 *   - The IV is prepended to the ciphertext so it is available for decryption
 *     without needing a separate storage field.
 *   - The 16-byte authentication tag is included in the ciphertext by
 *     SubtleCrypto automatically (GCM appends it).
 *
 * Output format (base64url, no padding):
 *   <12-byte-IV><ciphertext+16-byte-tag>
 *   → encoded as base64url string for storage / transport
 */

const IV_BYTES = 12; // GCM recommended IV length
const KEY_ALGORITHM = { name: "AES-GCM", length: 256 } as const;

// ── Key import ────────────────────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  if (hex.length !== 64) {
    throw new Error("KMS_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function importKey(hexKey: string): Promise<CryptoKey> {
  const raw = hexToBytes(hexKey);
  return crypto.subtle.importKey("raw", raw, KEY_ALGORITHM, false, ["encrypt", "decrypt"]);
}

// ── Base64url helpers (no-padding, URL-safe) ──────────────────────────────────

function bytesToBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBytes(b64: string): Uint8Array {
  const padded = b64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  const normalized = pad ? padded + "====".slice(pad) : padded;
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Encrypts `plaintext` using AES-256-GCM.
 *
 * @param plaintext  UTF-8 string to encrypt.
 * @param hexKey     64-char hex key (from KMS_ENCRYPTION_KEY env var).
 * @returns          Base64url-encoded ciphertext with IV prepended.
 */
export async function kmsEncrypt(plaintext: string, hexKey: string): Promise<string> {
  const key = await importKey(hexKey);
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  const cipherBytes = new Uint8Array(cipherBuffer);

  // Prepend IV to ciphertext
  const combined = new Uint8Array(IV_BYTES + cipherBytes.length);
  combined.set(iv, 0);
  combined.set(cipherBytes, IV_BYTES);

  return bytesToBase64url(combined);
}

/**
 * Decrypts a base64url token produced by `kmsEncrypt`.
 *
 * @param token   Output of `kmsEncrypt`.
 * @param hexKey  64-char hex key (from KMS_ENCRYPTION_KEY env var).
 * @returns       Original plaintext string.
 * @throws        DOMException (OperationError) if the tag validation fails
 *                (tampered ciphertext or wrong key).
 */
export async function kmsDecrypt(token: string, hexKey: string): Promise<string> {
  const key = await importKey(hexKey);
  const combined = base64urlToBytes(token);
  if (combined.length < IV_BYTES + 16) {
    throw new Error("KMS: ciphertext too short — likely corrupt");
  }

  const iv = combined.slice(0, IV_BYTES);
  const cipherBytes = combined.slice(IV_BYTES);
  const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipherBytes);
  return new TextDecoder().decode(plainBuffer);
}

/**
 * Returns whether KMS is available in the current environment.
 * Use this guard before calling encrypt/decrypt to produce a clear error
 * rather than a cryptic missing-key failure.
 */
export function isKmsConfigured(kmsKey: string | undefined): kmsKey is string {
  return typeof kmsKey === "string" && kmsKey.length === 64;
}
