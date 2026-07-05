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


  await test("entitlements.ts exports resolveEntitlements and requireEntitlement", async () => {
    const src = readFileSync("src/entitlements.ts", "utf8");
    assert(src.includes("export function resolveEntitlements"), "resolveEntitlements not exported");
    assert(src.includes("export function requireEntitlement"), "requireEntitlement not exported");
    assert(src.includes('"trialing"'), "trialing status not handled");
    assert(src.includes('"past_due"'), "past_due status not handled");
    assert(src.includes("GRACE_PERIOD_SECONDS"), "grace period not defined");
    assert(src.includes("email_verified"), "email_verified gate missing");
  });

  await test("kms.ts exports kmsEncrypt and kmsDecrypt", async () => {
    const src = readFileSync("src/kms.ts", "utf8");
    assert(src.includes("export async function kmsEncrypt"), "kmsEncrypt not exported");
    assert(src.includes("export async function kmsDecrypt"), "kmsDecrypt not exported");
    assert(src.includes("AES-GCM"), "AES-GCM cipher not used");
    assert(src.includes("enc:v1:"), "encryption prefix not defined");
  });

  await test("baseline.ts uses KMS encryption", async () => {
    const src = readFileSync("src/baseline.ts", "utf8");
    assert(src.includes("kmsEncryptJson"), "kmsEncryptJson not used in baseline");
    assert(src.includes("kmsDecryptJson"), "kmsDecryptJson not used in baseline");
  });

  await test("covenant.ts uses entitlements not requireActiveSubscription", async () => {
    const src = readFileSync("src/covenant.ts", "utf8");
    assert(src.includes("resolveEntitlements"), "resolveEntitlements not used in covenant");
    assert(src.includes("requireEntitlement"), "requireEntitlement not used in covenant");
    assert(!src.includes("requireActiveSubscription"), "old requireActiveSubscription still in covenant");
  });

  await test("alignment.ts uses entitlements not requireActiveSubscription", async () => {
    const src = readFileSync("src/alignment.ts", "utf8");
    assert(src.includes("resolveEntitlements"), "resolveEntitlements not used in alignment");
    assert(!src.includes("requireActiveSubscription"), "old requireActiveSubscription still in alignment");
  });

  await test("billing.ts handles trial_will_end and payment_intent.payment_failed", async () => {
    const src = readFileSync("src/billing.ts", "utf8");
    assert(src.includes("customer.subscription.trial_will_end"), "trial_will_end not handled");
    assert(src.includes("payment_intent.payment_failed"), "payment_intent.payment_failed not handled");
    assert(src.includes("sendTrialEndingEmail"), "sendTrialEndingEmail not called");
  });

  await test("auth.ts sessionCookie uses dynamic domain from env", async () => {
    const src = readFileSync("src/auth.ts", "utf8");
    assert(src.includes("domainPart"), "dynamic domain not used in sessionCookie");
    assert(src.includes("email_verified"), "email_verified not in AuthUser type");
    assert(src.includes("subscription_current_period_end"), "subscription_current_period_end not in getAuthUser");
  });

  await test("middleware/ai-rate-limit.ts exports checkAiRateLimit", async () => {
    const src = readFileSync("src/middleware/ai-rate-limit.ts", "utf8");
    assert(src.includes("export async function checkAiRateLimit"), "checkAiRateLimit not exported");
    assert(src.includes("burst"), "burst protection not implemented");
  });

  await test("explain-extended.ts uses per-user AI rate limiting", async () => {
    const src = readFileSync("src/explain-extended.ts", "utf8");
    assert(src.includes("checkAiRateLimit"), "checkAiRateLimit not called in explain");
    assert(src.includes("resolveEntitlements"), "resolveEntitlements not used in explain");
  });


  await test("analytics.ts exports emitMetric and trackAiCall", async () => {
    const src = readFileSync("src/analytics.ts", "utf8");
    assert(src.includes("export function emitMetric"), "emitMetric not exported");
    assert(src.includes("export async function trackAiCall"), "trackAiCall not exported");
    assert(src.includes("ANALYTICS"), "ANALYTICS binding not used");
  });

  await test("active-signals.ts traitLines declared before compound signals", async () => {
    const src = readFileSync("src/active-signals.ts", "utf8");
    const traitPos = src.indexOf("const traitLines: string[] = []");
    const compoundPos = src.indexOf("// HD type + Moon sign compound");
    assert(traitPos > 0, "traitLines declaration not found");
    assert(compoundPos > 0, "compound signals block not found");
    assert(traitPos < compoundPos, "traitLines must be declared before compound signals block");
  });

  await test("safety.ts exports SimpleSafetyEvent interface", async () => {
    const src = readFileSync("src/safety.ts", "utf8");
    assert(src.includes("export interface SimpleSafetyEvent"), "SimpleSafetyEvent not exported");
    assert(src.includes("level:"), "level field missing from SimpleSafetyEvent");
  });

  await test("auth.ts has stricter KV-based rate limiting for login/register", async () => {
    const src = readFileSync("src/auth.ts", "utf8");
    assert(src.includes("checkAuthRateLimit"), "checkAuthRateLimit not defined");
    assert(src.includes("15 minutes"), "15-minute window not configured");
  });


  await test("billing.ts has 7-day trial period in checkout", async () => {
    const src = readFileSync("src/billing.ts", "utf8");
    assert(src.includes("trial_period_days"), "7-day trial not configured in checkout");
    assert(src.includes("allow_promotion_codes"), "promotion codes not enabled");
  });

  await test("prompts.ts has nextSpace field in Defrag output contract", async () => {
    const src = readFileSync("src/prompts.ts", "utf8");
    assert(src.includes("nextSpace"), "nextSpace field missing from Defrag output contract");
    assert(src.includes("ALIGNMENT"), "ALIGNMENT option missing from nextSpace");
    assert(src.includes("COVENANT"), "COVENANT option missing from nextSpace");
  });

  console.log("\n✅ All regression tests passed\n");
}

runTests().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
