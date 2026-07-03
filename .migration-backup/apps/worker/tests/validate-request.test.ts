import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  validateContentType,
  validateContentLength,
  validateJsonBody,
  validateRequest,
} from "../src/middleware/validate-request";

describe("Validation Middleware", () => {
  describe("validateContentType", () => {
    it("accepts valid JSON content-type", () => {
      const req = new Request("http://localhost", {
        headers: { "content-type": "application/json" },
      });
      const result = validateContentType(req);
      expect(result.valid).toBe(true);
    });

    it("accepts JSON with charset", () => {
      const req = new Request("http://localhost", {
        headers: { "content-type": "application/json; charset=utf-8" },
      });
      const result = validateContentType(req);
      expect(result.valid).toBe(true);
    });

    it("rejects non-JSON content-type", () => {
      const req = new Request("http://localhost", {
        headers: { "content-type": "text/plain" },
      });
      const result = validateContentType(req);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.status).toBe(415);
      }
    });

    it("rejects missing content-type", () => {
      const req = new Request("http://localhost");
      const result = validateContentType(req);
      expect(result.valid).toBe(false);
    });

    it("supports custom content-type", () => {
      const req = new Request("http://localhost", {
        headers: { "content-type": "text/plain" },
      });
      const result = validateContentType(req, "text/plain");
      expect(result.valid).toBe(true);
    });
  });

  describe("validateContentLength", () => {
    it("accepts content within size limit", () => {
      const req = new Request("http://localhost", {
        headers: { "content-length": "1000" },
      });
      const result = validateContentLength(req, 2000);
      expect(result.valid).toBe(true);
    });

    it("rejects oversized content", () => {
      const req = new Request("http://localhost", {
        headers: { "content-length": "5000" },
      });
      const result = validateContentLength(req, 2000);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.status).toBe(413);
      }
    });

    it("handles missing content-length as 0", () => {
      const req = new Request("http://localhost");
      const result = validateContentLength(req, 2000);
      expect(result.valid).toBe(true);
    });

    it("uses default max size of 100KB", () => {
      const req = new Request("http://localhost", {
        headers: { "content-length": String(101 * 1024) },
      });
      const result = validateContentLength(req);
      expect(result.valid).toBe(false);
    });
  });

  describe("validateJsonBody", () => {
    const testSchema = z.object({
      name: z.string(),
      age: z.number().min(0),
    });

    it("accepts valid JSON matching schema", async () => {
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ name: "Alice", age: 30 }),
      });
      const result = await validateJsonBody(req, testSchema);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.name).toBe("Alice");
        expect(result.data.age).toBe(30);
      }
    });

    it("rejects invalid JSON", async () => {
      const req = new Request("http://localhost", {
        method: "POST",
        body: "not json {",
      });
      const result = await validateJsonBody(req, testSchema);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.status).toBe(400);
        expect(result.error.error).toContain("Invalid JSON");
      }
    });

    it("rejects JSON not matching schema", async () => {
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ name: "Alice", age: "not a number" }),
      });
      const result = await validateJsonBody(req, testSchema);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.status).toBe(400);
        expect(result.error.field).toContain("age");
      }
    });

    it("rejects missing required fields", async () => {
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ name: "Alice" }),
      });
      const result = await validateJsonBody(req, testSchema);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.field).toContain("age");
      }
    });

    it("provides field path for nested errors", async () => {
      const nestedSchema = z.object({
        user: z.object({
          email: z.string().email(),
        }),
      });
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ user: { email: "not-an-email" } }),
      });
      const result = await validateJsonBody(req, nestedSchema);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.field).toContain("email");
      }
    });
  });

  describe("validateRequest", () => {
    const testSchema = z.object({
      message: z.string(),
    });

    it("validates content-type and body together", async () => {
      const req = new Request("http://localhost", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "25",
        },
        body: JSON.stringify({ message: "Hello" }),
      });
      const result = await validateRequest(req, testSchema);
      expect(result.valid).toBe(true);
    });

    it("fails on invalid content-type before checking body", async () => {
      const req = new Request("http://localhost", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "invalid",
      });
      const result = await validateRequest(req, testSchema);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.field).toBe("content-type");
      }
    });

    it("fails on oversized body before parsing", async () => {
      const req = new Request("http://localhost", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "5000",
        },
        body: JSON.stringify({ message: "Hello" }),
      });
      const result = await validateRequest(req, testSchema, {
        maxBodySize: 1000,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.field).toBe("content-length");
      }
    });

    it("allows skipping content-type check", async () => {
      const req = new Request("http://localhost", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: JSON.stringify({ message: "Hello" }),
      });
      const result = await validateRequest(req, testSchema, {
        validateContentType: false,
      });
      expect(result.valid).toBe(true);
    });

    it("stops at first validation failure", async () => {
      const req = new Request("http://localhost", {
        method: "POST",
        headers: {
          "content-type": "text/plain",
          "content-length": "5000",
        },
        body: "invalid json",
      });
      const result = await validateRequest(req, testSchema, {
        maxBodySize: 1000,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        // Should fail on content-type first
        expect(result.error.field).toBe("content-type");
      }
    });
  });
});
