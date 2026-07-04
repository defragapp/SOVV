import { describe, expect, it } from "vitest";
import { parseJsonBody, validateTextInput } from "../src/safety-validation";

describe("parseJsonBody", () => {
  it("rejects malformed JSON", async () => {
    const request = new Request("https://example.com/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{invalid",
    });

    const result = await parseJsonBody(request);
    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.response.status).toBe(400);
      await expect(result.response.json()).resolves.toEqual({
        error: "invalid_json",
        message: "Invalid JSON body.",
      });
    }
  });

  it("rejects non-object JSON payloads", async () => {
    const request = new Request("https://example.com/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(["not", "an", "object"]),
    });

    const result = await parseJsonBody(request);
    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.response.status).toBe(400);
      await expect(result.response.json()).resolves.toEqual({
        error: "invalid_body",
        message: "JSON body must be an object.",
      });
    }
  });
});

describe("validateTextInput", () => {
  const request = new Request("https://example.com/api/alignment", {
    method: "POST",
    headers: { Origin: "https://app.defrag.app" },
  });

  it("accepts the first populated field alias and trims it", () => {
    const result = validateTextInput({
      request,
      body: { question: "  Need help with this conflict  " },
      fields: ["message", "question", "text"],
      requiredPayload: { error: "message_required" },
      maxLength: 2000,
      supportMode: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.field).toBe("question");
      expect(result.value.text).toBe("Need help with this conflict");
    }
  });

  it("returns the support response before AI processing", async () => {
    const result = validateTextInput({
      request,
      body: { message: "I want to die" },
      fields: ["message"],
      requiredPayload: { error: "Message is required" },
      maxLength: 2000,
      supportMode: true,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(200);
      await expect(result.response.json()).resolves.toMatchObject({
        type: "support",
      });
    }
  });

  it("enforces the configured max length", async () => {
    const result = validateTextInput({
      request,
      body: { message: "x".repeat(2001) },
      fields: ["message"],
      requiredPayload: { error: "Message is required" },
      tooLongPayload: { error: "Input too long. Please keep your message under 2000 characters." },
      maxLength: 2000,
      supportMode: true,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      await expect(result.response.json()).resolves.toEqual({
        error: "Input too long. Please keep your message under 2000 characters.",
      });
    }
  });
});
