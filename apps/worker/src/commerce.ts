import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { fetchWithTimeout, withLimitedRetry } from "./runtime-resilience.js";

const DEFAULT_GUIDE_PRICE_CENTS = 1000;

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function list(items: unknown): string {
  if (!Array.isArray(items) || items.length === 0) return "<p class=\"muted\">No additional detail is available yet.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

export async function handleBaselineGuideCheckout(req: Request, env: Env): Promise<Response> {
  const user = await getAuthUser(req, env.DB);
  if (!user) {
    return json({ error: "unauthorized", message: "Sign in to create a personalized Baseline Guide." }, 401);
  }

  if (!env.STRIPE_SECRET_KEY || !env.APP_URL) {
    return json({ error: "commerce_not_configured" }, 503);
  }

  const dataset = await env.KV.get(`user-dataset:${user.id}`);
  if (!dataset) {
    return json({
      error: "baseline_required",
      message: "Complete your Baseline Design before purchasing the guide.",
    }, 409);
  }

  const configuredAmount = Number.parseInt(env.BASELINE_GUIDE_PRICE_CENTS ?? "", 10);
  const unitAmount = Number.isFinite(configuredAmount) && configuredAmount >= 500
    ? configuredAmount
    : DEFAULT_GUIDE_PRICE_CENTS;

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", String(unitAmount));
  params.set("line_items[0][price_data][product_data][name]", "Your Baseline Guide");
  params.set(
    "line_items[0][price_data][product_data][description]",
    "A branded, downloadable personal operating guide generated from your Baseline Design."
  );
  params.set("line_items[0][quantity]", "1");
  params.set("client_reference_id", user.id);
  params.set("customer_email", user.email);
  params.set("payment_intent_data[metadata][userId]", user.id);
  params.set("payment_intent_data[metadata][purchaseType]", "baseline_guide");
  params.set("metadata[userId]", user.id);
  params.set("metadata[purchaseType]", "baseline_guide");
  params.set(
    "success_url",
    `${env.APP_URL}/baseline-guide?purchase=success&session_id={CHECKOUT_SESSION_ID}`
  );
  params.set("cancel_url", `${env.APP_URL}/baseline-guide?purchase=canceled`);
  params.set("automatic_tax[enabled]", "true");

  const response = await withLimitedRetry(
    "stripe_baseline_guide_checkout",
    () => fetchWithTimeout(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Idempotency-Key": `baseline-guide:${user.id}:${new Date().toISOString().slice(0, 10)}`,
        },
        body: params.toString(),
      },
      10_000
    ),
    2,
    10_000
  );

  const payload = await response.json() as Record<string, unknown>;
  if (!response.ok || typeof payload.url !== "string") {
    return json({ error: "checkout_failed" }, 503);
  }

  return json({ url: payload.url });
}

export async function handleBaselineGuideVerify(req: Request, env: Env): Promise<Response> {
  const user = await getAuthUser(req, env.DB);
  if (!user) return json({ error: "unauthorized" }, 401);
  if (!env.STRIPE_SECRET_KEY) return json({ error: "commerce_not_configured" }, 503);

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId || !/^cs_(test|live)_/.test(sessionId)) {
    return json({ error: "invalid_session" }, 400);
  }

  const response = await fetchWithTimeout(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } },
    10_000
  );
  const payload = await response.json() as Record<string, any>;

  const validPurchase = response.ok
    && payload.payment_status === "paid"
    && payload.mode === "payment"
    && payload.client_reference_id === user.id
    && payload.metadata?.purchaseType === "baseline_guide";

  if (!validPurchase) return json({ error: "purchase_not_verified" }, 402);

  const record = {
    userId: user.id,
    sessionId,
    paymentIntentId: typeof payload.payment_intent === "string" ? payload.payment_intent : null,
    amountTotal: typeof payload.amount_total === "number" ? payload.amount_total : null,
    currency: typeof payload.currency === "string" ? payload.currency : "usd",
    purchasedAt: Date.now(),
    status: "paid",
  };

  await env.KV.put(`purchase:baseline-guide:${user.id}`, JSON.stringify(record));
  return json({ verified: true, purchase: record, downloadUrl: "/api/commerce/baseline-guide/download" });
}

export async function handleBaselineGuideDownload(req: Request, env: Env): Promise<Response> {
  const user = await getAuthUser(req, env.DB);
  if (!user) return json({ error: "unauthorized" }, 401);

  const [purchaseRaw, datasetRaw] = await Promise.all([
    env.KV.get(`purchase:baseline-guide:${user.id}`),
    env.KV.get(`user-dataset:${user.id}`),
  ]);

  if (!purchaseRaw) return json({ error: "purchase_required" }, 402);
  if (!datasetRaw) return json({ error: "baseline_not_ready" }, 409);

  let dataset: Record<string, any>;
  try {
    dataset = JSON.parse(datasetRaw) as Record<string, any>;
  } catch {
    return json({ error: "baseline_invalid" }, 500);
  }

  if (dataset.status !== "ready" || !dataset.aiDataset) {
    return json({ error: "baseline_not_ready" }, 409);
  }

  const ai = dataset.aiDataset as Record<string, any>;
  const overlays = ai.appOverlays ?? {};
  const traits = Array.isArray(ai.derivedTraits) ? ai.derivedTraits.slice(0, 8) : [];
  const generated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  const traitCards = traits.map((trait: Record<string, any>) => `
    <section class="trait">
      <p class="eyebrow">${escapeHtml((trait.sourceFrameworks ?? []).join(" · "))}</p>
      <h3>${escapeHtml(trait.label ?? trait.key)}</h3>
      ${list(trait.alignedExpression)}
      ${trait.usableAction ? `<p class="action"><strong>Use this:</strong> ${escapeHtml(trait.usableAction)}</p>` : ""}
    </section>
  `).join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Your Baseline Guide</title>
<style>
  :root{color-scheme:dark;--bg:#08070a;--panel:#0c0a0d;--ink:#f4efe9;--muted:#a8a29a;--accent:#e0743a;--line:rgba(255,255,255,.09)}
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;line-height:1.55}
  main{max-width:880px;margin:0 auto;padding:72px 36px 96px}.brand{font:600 11px ui-monospace,monospace;letter-spacing:.28em;text-transform:uppercase;color:var(--muted)}
  h1,h2,h3{font-family:Georgia,serif;font-weight:400;letter-spacing:-.025em} h1{font-size:64px;line-height:.96;margin:44px 0 24px} h2{font-size:36px;margin:64px 0 22px} h3{font-size:25px;margin:8px 0 14px}
  .lead{font-size:19px;color:var(--muted);max-width:700px}.meta{margin-top:28px;padding-top:18px;border-top:1px solid var(--line);font-size:12px;color:var(--muted)}
  .anchors,.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.card,.trait{border:1px solid var(--line);background:var(--panel);border-radius:18px;padding:22px}
  .eyebrow{font:600 9px ui-monospace,monospace;text-transform:uppercase;letter-spacing:.18em;color:var(--accent)} ul{padding-left:18px;color:var(--muted)} li{margin:8px 0}.action{border-top:1px solid var(--line);padding-top:14px;color:var(--ink)}
  .muted{color:var(--muted)} footer{margin-top:72px;border-top:1px solid var(--line);padding-top:22px;color:var(--muted);font-size:12px}
  @media(max-width:680px){main{padding:48px 22px 72px}h1{font-size:46px}.anchors,.grid{grid-template-columns:1fr}}
  @media print{body{background:#fff;color:#111}.card,.trait{background:#fff;border-color:#ddd}.lead,.meta,.muted,ul,footer{color:#444}.eyebrow{color:#a64c20}main{padding:24px}.trait{break-inside:avoid}}
</style>
</head>
<body>
<main>
  <p class="brand">Sovereign.os · Baseline Design</p>
  <h1>Your Baseline Guide</h1>
  <p class="lead">A personal operating guide for understanding your patterns, making clearer decisions, and helping the people closest to you understand how you work.</p>
  <p class="meta">Generated ${escapeHtml(generated)} · Private personal edition · ${escapeHtml(user.email)}</p>

  <h2>Your identity anchors</h2>
  <div class="anchors">${(ai.identityAnchors ?? []).map((anchor: unknown) => `<div class="card">${escapeHtml(anchor)}</div>`).join("")}</div>

  <h2>How you operate</h2>
  <div class="grid">${traitCards}</div>

  <h2>When pressure rises</h2>
  <div class="card">${list(overlays.defrag?.pressurePatterns)}</div>

  <h2>How you return to clarity</h2>
  <div class="card">${list(overlays.defrag?.repairMoves)}</div>

  <h2>Your alignment signals</h2>
  <div class="grid">
    <div class="card"><p class="eyebrow">You are aligned when</p>${list(overlays.alignment?.alignmentSignals)}</div>
    <div class="card"><p class="eyebrow">Watch for</p>${list(overlays.alignment?.misalignmentSignals)}</div>
  </div>

  <h2>Practical action rules</h2>
  <div class="card">${list(overlays.alignment?.actionRules)}</div>

  <footer>This guide is reflective decision support, not medical, legal, financial, or mental-health treatment. Keep it private or share it intentionally with people you trust.</footer>
</main>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sovereign-baseline-guide.html"',
      "Cache-Control": "private, no-store",
    },
  });
}

export async function handleSupportRedirect(env: Env): Promise<Response> {
  const url = env.STRIPE_SUPPORT_LINK_URL;
  if (!url || !url.startsWith("https://buy.stripe.com/")) {
    return json({ error: "support_link_not_configured" }, 404);
  }
  return Response.redirect(url, 302);
}
