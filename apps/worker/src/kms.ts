/**
 * kms.ts
 *
 * AES-GCM encryption/decryption for sensitive user data stored in KV.
 * Used to encrypt Baseline Design data (natal, behavioral patterns) at rest.
 *
 * Key derivation: PBKDF2-SHA256 from KMS_SECRET worker secret.
 * Cipher: AES-256-GCM with random 96-bit IV per encryption.
 * Output format: base64(iv + ciphertext + authTag) prefixed with "enc:v1:"
 *
 * Usage:
 *   const encrypted = await kmsEncrypt(env, plaintext)
 *   const plaintext = await kmsDecrypt(env, encrypted)
 *
 * If KMS_SECRET is not set, data is stored unencrypted (dev/migration mode).
 * This allows gradual rollout without breaking existing unencrypted records.
 */

const ENC_PREFIX = "enc:v1:";
const IV_LENGTH = 12; // 96-bit IV for AES-GCM
const SALT = new TextEncoder().encode("sovereign-os-kms-v1"); // fixed salt for key derivation

async function deriveKey(secret: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: SALT, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns "enc:v1:<base64>" or the original string if KMS_SECRET is not set.
 */
export async function kmsEncrypt(kmsSecret: string | undefined, plaintext: string): Promise<string> {
  if (!kmsSecret) return plaintext; // No-op if secret not configured

  const key = await deriveKey(kmsSecret);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  // Combine IV + ciphertext (AES-GCM auth tag is appended by Web Crypto)
  const combined = new Uint8Array(IV_LENGTH + cipherBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuffer), IV_LENGTH);

  return ENC_PREFIX + btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt an encrypted string. Returns plaintext.
 * If the value is not encrypted (no prefix), returns it as-is for backward compat.
 */
export async function kmsDecrypt(kmsSecret: string | undefined, value: string): Promise<string> {
  if (!value.startsWith(ENC_PREFIX)) return value; // Unencrypted (legacy or no KMS)
  if (!kmsSecret) {
    throw new Error("KMS_SECRET required to decrypt encrypted data");
  }

  const key = await deriveKey(kmsSecret);
  const combined = Uint8Array.from(atob(value.slice(ENC_PREFIX.length)), (c) => c.charCodeAt(0));

  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(plainBuffer);
}

/**
 * Check if a value is encrypted with the current KMS scheme.
 */
export function isEncrypted(value: string): boolean {
  return value.startsWith(ENC_PREFIX);
}

/**
 * Encrypt a JSON-serializable object. Returns encrypted string.
 */
export async function kmsEncryptJson<T>(kmsSecret: string | undefined, data: T): Promise<string> {
  return kmsEncrypt(kmsSecret, JSON.stringify(data));
}

/**
 * Decrypt and parse a JSON-encrypted value.
 */
export async function kmsDecryptJson<T>(kmsSecret: string | undefined, value: string): Promise<T> {
  const plaintext = await kmsDecrypt(kmsSecret, value);
  return JSON.parse(plaintext) as T;
}
