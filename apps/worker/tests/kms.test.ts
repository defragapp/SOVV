/**
 * kms.test.ts
 *
 * Tests for AES-256-GCM encryption/decryption module.
 * Covers: encrypt/decrypt round-trip, backward compat with unencrypted data,
 * missing KMS_SECRET passthrough, JSON helpers, isEncrypted detection.
 */

import { describe, it, expect } from "vitest"
import { kmsEncrypt, kmsDecrypt, kmsEncryptJson, kmsDecryptJson, isEncrypted } from "../src/kms.js"

const TEST_SECRET = "test-secret-key-for-unit-tests-only-32b"

describe("kmsEncrypt / kmsDecrypt", () => {
  it("encrypts and decrypts a string round-trip", async () => {
    const plaintext = "Hello, Sovereign.os!"
    const encrypted = await kmsEncrypt(TEST_SECRET, plaintext)
    expect(encrypted).not.toBe(plaintext)
    expect(encrypted.startsWith("enc:v1:")).toBe(true)
    const decrypted = await kmsDecrypt(TEST_SECRET, encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it("produces different ciphertext each time (random IV)", async () => {
    const plaintext = "same input"
    const enc1 = await kmsEncrypt(TEST_SECRET, plaintext)
    const enc2 = await kmsEncrypt(TEST_SECRET, plaintext)
    expect(enc1).not.toBe(enc2)
    // But both decrypt to the same value
    expect(await kmsDecrypt(TEST_SECRET, enc1)).toBe(plaintext)
    expect(await kmsDecrypt(TEST_SECRET, enc2)).toBe(plaintext)
  })

  it("passes through unencrypted data (backward compat)", async () => {
    const plaintext = '{"dob":"1990-04-03","pob":"Chicago"}'
    // No enc:v1: prefix — legacy unencrypted data
    const result = await kmsDecrypt(TEST_SECRET, plaintext)
    expect(result).toBe(plaintext)
  })

  it("returns plaintext unchanged when KMS_SECRET is undefined", async () => {
    const plaintext = "no encryption"
    const result = await kmsEncrypt(undefined, plaintext)
    expect(result).toBe(plaintext)
  })

  it("decrypts unencrypted data when KMS_SECRET is undefined", async () => {
    const plaintext = "raw data"
    const result = await kmsDecrypt(undefined, plaintext)
    expect(result).toBe(plaintext)
  })

  it("throws when trying to decrypt encrypted data without KMS_SECRET", async () => {
    const encrypted = await kmsEncrypt(TEST_SECRET, "secret data")
    await expect(kmsDecrypt(undefined, encrypted)).rejects.toThrow()
  })

  it("encrypts empty string", async () => {
    const encrypted = await kmsEncrypt(TEST_SECRET, "")
    const decrypted = await kmsDecrypt(TEST_SECRET, encrypted)
    expect(decrypted).toBe("")
  })

  it("encrypts unicode and special characters", async () => {
    const plaintext = "Healing isn't optional. 🌟 Pattern-aware AI — Sovereign.os"
    const encrypted = await kmsEncrypt(TEST_SECRET, plaintext)
    const decrypted = await kmsDecrypt(TEST_SECRET, encrypted)
    expect(decrypted).toBe(plaintext)
  })
})

describe("kmsEncryptJson / kmsDecryptJson", () => {
  it("encrypts and decrypts a JSON object", async () => {
    const data = { dob: "1990-04-03", tob: { type: "exact", value: "07:42" }, pob: "Chicago, IL" }
    const encrypted = await kmsEncryptJson(TEST_SECRET, data)
    expect(encrypted.startsWith("enc:v1:")).toBe(true)
    const decrypted = await kmsDecryptJson(TEST_SECRET, encrypted)
    expect(decrypted).toEqual(data)
  })

  it("handles nested objects and arrays", async () => {
    const data = { patterns: ["loop1", "loop2"], meta: { count: 42, active: true } }
    const encrypted = await kmsEncryptJson(TEST_SECRET, data)
    const decrypted = await kmsDecryptJson<typeof data>(TEST_SECRET, encrypted)
    expect(decrypted.patterns).toEqual(["loop1", "loop2"])
    expect(decrypted.meta.count).toBe(42)
  })
})

describe("isEncrypted", () => {
  it("returns true for encrypted values", async () => {
    const encrypted = await kmsEncrypt(TEST_SECRET, "test")
    expect(isEncrypted(encrypted)).toBe(true)
  })

  it("returns false for plain text", () => {
    expect(isEncrypted("plain text")).toBe(false)
    expect(isEncrypted('{"json":"data"}')).toBe(false)
    expect(isEncrypted("")).toBe(false)
  })
})
