import { describe, expect, it } from "vitest"
import { applyUnifiedHunks, parseUnifiedPatch } from "./repo-patch-runtime.js"

describe("repo patch runtime", () => {
  it("parses and applies a single-file unified diff", () => {
    const patch = [
      "--- a/example.txt",
      "+++ b/example.txt",
      "@@ -1,3 +1,3 @@",
      " alpha",
      "-beta",
      "+bravo",
      " gamma",
    ].join("\n")

    const [file] = parseUnifiedPatch(patch)
    expect(file.path).toBe("example.txt")
    expect(applyUnifiedHunks("alpha\nbeta\ngamma", file)).toBe("alpha\nbravo\ngamma")
  })

  it("supports multiple files", () => {
    const patch = [
      "--- a/one.txt",
      "+++ b/one.txt",
      "@@ -1 +1 @@",
      "-one",
      "+ONE",
      "--- a/two.txt",
      "+++ b/two.txt",
      "@@ -1 +1 @@",
      "-two",
      "+TWO",
    ].join("\n")

    const files = parseUnifiedPatch(patch)
    expect(files.map((file) => file.path)).toEqual(["one.txt", "two.txt"])
  })

  it("rejects patches that create new files", () => {
    expect(() => parseUnifiedPatch("--- /dev/null\n+++ b/new.txt\n@@ -0,0 +1 @@\n+new")).toThrow(
      "Patch must target an existing repository file",
    )
  })

  it("rejects context mismatches", () => {
    const [file] = parseUnifiedPatch("--- a/example.txt\n+++ b/example.txt\n@@ -1 +1 @@\n-wrong\n+right")
    expect(() => applyUnifiedHunks("actual", file)).toThrow("Removal mismatch")
  })
})
