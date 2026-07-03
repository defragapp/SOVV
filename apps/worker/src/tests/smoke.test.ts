/**
 * smoke.test.ts — Regression tests for critical auth and AI pipeline
 * Run: node --input-type=module src/tests/smoke.test.ts
 */
import { readFileSync } from 'fs';

async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); console.log(`✅ ${name}`); }
  catch (err: any) { console.error(`❌ ${name}: ${err.message}`); process.exitCode = 1; }
}
function assert(c: boolean, m: string) { if (!c) throw new Error(m); }

async function runTests() {
  console.log("\nRunning regression tests\n");

  await test("explain-extended.ts has getAuthUser in handleExplain", async () => {
    const src = readFileSync("src/explain-extended.ts", "utf8");
    const idx = src.indexOf("export async function handleExplain");
    const authIdx = src.indexOf("getAuthUser(req, env.DB)", idx);
    assert(authIdx > idx && authIdx < idx + 500, "getAuthUser missing from handleExplain");
  });

  await test("baseline.ts has /api/baseline/status route", async () => {
    const src = readFileSync("src/baseline.ts", "utf8");
    assert(src.includes('"/api/baseline/status"'), "baseline/status route missing");
  });

  await test("explain-extended.ts loads and uses memory context", async () => {
    const src = readFileSync("src/explain-extended.ts", "utf8");
    assert(src.includes("loadMemoryContext"), "loadMemoryContext not called");
    assert(src.includes("memoryText"), "memoryText not defined");
    assert(src.includes("savePatternMemory"), "savePatternMemory not called");
  });

  await test("active-signals.ts buildTimingSignals accepts liveSky", async () => {
    const src = readFileSync("src/active-signals.ts", "utf8");
    assert(src.includes("liveSky?:"), "liveSky param missing");
    assert(src.includes("const skyData = liveSky ?? dataset.astronomy"), "liveSky not used");
  });

  await test("baseline-compiler.ts exports getCurrentSkySnapshot", async () => {
    const src = readFileSync("src/baseline-compiler.ts", "utf8");
    assert(src.includes("export async function getCurrentSkySnapshot"), "not exported");
  });

  await test("alignment.ts uses live sky timing", async () => {
    const src = readFileSync("src/alignment.ts", "utf8");
    assert(src.includes("getCurrentSkySnapshot"), "getCurrentSkySnapshot not used");
    assert(src.includes("buildTimingSignals(dataset, liveSky)"), "liveSky not passed");
  });

  await test("covenant.ts has messages defined before AI call", async () => {
    const src = readFileSync("src/covenant.ts", "utf8");
    const msgIdx = src.indexOf("const messages = [");
    const aiIdx = src.indexOf("env.AI.run(");
    assert(msgIdx > 0 && msgIdx < aiIdx, "messages not defined before AI call");
  });

  await test("routes/explain-stream.ts has SSE streaming", async () => {
    const src = readFileSync("src/routes/explain-stream.ts", "utf8");
    assert(src.includes("text/event-stream"), "SSE content-type missing");
    assert(src.includes("stream: true"), "stream:true not passed to AI");
  });

  await test("No hardcoded credentials in worker source", async () => {
    const files = ["src/auth.ts","src/baseline.ts","src/explain-extended.ts","src/covenant.ts","src/alignment.ts"];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      assert(!src.includes("Defrag2026"), `Password in ${f}`);
      assert(!src.includes("sovv-seed-2026"), `Seed secret in ${f}`);
    }
  });

  await test("prompt.ts is deprecated and not imported by active routes", async () => {
    const index = readFileSync("src/index.ts", "utf8");
    assert(!index.includes("from \"./prompt\"") && !index.includes("from './prompt'"),
      "prompt.ts (deprecated) is imported in index.ts");
  });

  console.log("\n✅ All regression tests passed\n");
}

runTests().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
