/**
 * KMS unit tests — verifies AES-256-GCM round-trip and error paths.
 * These tests run in Node (via vitest) using the native Web Crypto API.
 */

import { describe, it, expect } from "vitest";
import { kmsEncrypt, kmsDecrypt, isKmsConfigured } from "../kms.js";

// A deterministic 64-char hex test key (NOT used outside tests)
const TEST_KEY = "a".repeat(64);
const TEST_KEY_2 = "b".repeat(64);

describe("isKmsConfigured", () => {
  it("returns true for a valid 64-char hex key", () => {
    expect(isKmsConfigured(TEST_KEY)).toBe(true);
  });

  it("returns false for undefined", () => {
    expect(isKmsConfigured(undefined)).toBe(false);
  });

  it("returns false for a short key", () => {
    expect(isKmsConfigured("abc123")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isKmsConfigured("")).toBe(false);
  });
});

describe("kmsEncrypt / kmsDecrypt — round trip", () => {
  it("encrypts and decrypts a short string correctly", async () => {
    const plain = "Hello, Sovereign.";
    const token = await kmsEncrypt(plain, TEST_KEY);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
    const result = await kmsDecrypt(token, TEST_KEY);
    expect(result).toBe(plain);
  });

  it("encrypts and decrypts a long UTF-8 string", async () => {
    const plain = "🌙 ".repeat(500) + "end";
    const token = await kmsEncrypt(plain, TEST_KEY);
    expect(await kmsDecrypt(token, TEST_KEY)).toBe(plain);
  });

  it("produces different ciphertext for the same plaintext (random IV)", async () => {
    const plain = "same-input";
    const t1 = await kmsEncrypt(plain, TEST_KEY);
    const t2 = await kmsEncrypt(plain, TEST_KEY);
    expect(t1).not.toBe(t2);
  });

  it("produces a base64url-safe token (no +, /, or = chars)", async () => {
    const token = await kmsEncrypt("test", TEST_KEY);
    expect(token).not.toMatch(/[+/=]/);
  });
});

describe("kmsDecrypt — error paths", () => {
  it("throws when decrypting with a different key (tag mismatch)", async () => {
    const token = await kmsEncrypt("secret data", TEST_KEY);
    await expect(kmsDecrypt(token, TEST_KEY_2)).rejects.toThrow();
  });

  it("throws on a truncated token", async () => {
    await expect(kmsDecrypt("tooshort", TEST_KEY)).rejects.toThrow(/too short|corrupt/i);
  });

  it("throws on a tampered ciphertext", async () => {
    const token = await kmsEncrypt("sensitive", TEST_KEY);
    // Decode to bytes, flip a byte in the ciphertext (after the 12-byte IV),
    // and re-encode. This reliably corrupts the AES-GCM auth tag.
    const raw = token.replace(/-/g, "+").replace(/_/g, "/");
    const padded = raw + "====".slice(raw.length % 4 || 4);
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    bytes[12] ^= 0xff; // flip a byte in the ciphertext (index 12 = first ciphertext byte)
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const tampered = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    await expect(kmsDecrypt(tampered, TEST_KEY)).rejects.toThrow();
  });
});
