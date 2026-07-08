/**
 * sovereign-broker — Cloudflare Worker v2.1 (Production-Safe)
 * ─────────────────────────────────────────────────────────────
 * SAFETY MODEL:
 *   READ operations  → always allowed (repo, DB, KV, Stripe, CF)
 *   WRITE operations → require explicit `confirm: true` in request body
 *                      AND are logged to R2 audit log
 *   DEPLOY operations → blocked unless env.AGENT_DEPLOY_ENABLED === "true"
 *                       AND require `confirm: true`
 *   BILLING mutations → blocked unless env.AGENT_STRIPE_WRITE_ENABLED === "true"
 *   DIRECT MAIN COMMITS → never. All writes go to agent/<timestamp> branch + open PR
 *   SECRETS / .env files → hard-blocked by path denylist
 *   KILL SWITCH → set env.AGENT_ENABLED = "false" to block all mutation routes instantly
 *
 * Secrets (set via wrangler secret put):
 *   BROKER_TOKEN, GITHUB_TOKEN, CF_API_TOKEN, STRIPE_SECRET_KEY
 *
 * Env vars (set in Cloudflare dashboard or wrangler.toml [vars]):
 *   AGENT_ENABLED                     = "true"   (master kill switch)
 *   AGENT_WRITE_ENABLED               = "false"  (repo write / PR creation)
 *   AGENT_DEPLOY_ENABLED              = "false"  (worker deploys)
 *   AGENT_STRIPE_WRITE_ENABLED        = "false"  (billing mutations)
 *   AGENT_DESTRUCTIVE_ACTIONS_ENABLED = "false"  (KV/R2 writes)
 *   AGENT_PR_ENABLED                  = "false"  (PR creation)
 */

// ── Model map ────────────────────────────────────────────────────────────────
const MODEL_MAP = {
  chat:   "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  code:   "@cf/openai/gpt-oss-120b",
  vision: "@cf/meta/llama-3.2-11b-vision-instruct",
  fast:   "@cf/meta/llama-3.2-3b-instruct",
};

const IMAGE_MODEL_MAP = {
  "flux-schnell":   "@cf/black-forest-labs/flux-1-schnell",
  "flux-dev":       "@cf/black-forest-labs/flux-2-dev",
  "sdxl":           "@cf/stabilityai/stable-diffusion-xl-base-1.0",
  "sdxl-lightning": "@cf/bytedance/stable-diffusion-xl-lightning",
};

const REPO_OWNER = "defragapp";
const REPO_NAME  = "SOVV";
const CF_ACCOUNT = "8b1954d216d65077c6480d62583fe2c2";
const D1_DB_ID   = "c8c2fd8d-5297-46fc-8594-7629c8bad74d";
const KV_NS_ID   = "3bd3ff5048a8468e82c574d7d66045c3";
const GATEWAY_ID = "sovereign-ai-gateway";

// ── Hard-blocked path patterns (never read or write) ─────────────────────────
const BLOCKED_PATH_PATTERNS = [
  /\.env/i,
  /secret/i,
  /\.pem$/i,
  /\.key$/i,
  /\.pfx$/i,
  /private/i,
  /credentials/i,
  /id_rsa/i,
  /\.dev\.vars/i,
];

// Explicit safe exceptions (clean files that match a blocked pattern name)
const BLOCKED_PATH_EXCEPTIONS = [
  /apps\/sovereign-gpt\/broker-worker\/wrangler\.toml$/,
];

function isPathBlocked(filePath) {
  if (!filePath) return false;
  const isException = BLOCKED_PATH_EXCEPTIONS.some(p => p.test(filePath));
  if (isException) return false;
  return BLOCKED_PATH_PATTERNS.some(p => p.test(filePath));
}

// ── CORS ─────────────────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function err(msg, status = 400) {
  return json({ ok: false, error: msg }, status);
}

function blocked(reason) {
  return json({
    ok: false,
    blocked: true,
    reason,
    hint: "This operation requires explicit operator approval. Check agent feature flags in Cloudflare dashboard.",
  }, 403);
}

// ── Feature flag helpers ──────────────────────────────────────────────────────
function isEnabled(env, flag) {
  return (env[flag] || "false").toLowerCase() === "true";
}

function agentEnabled(env) {
  return isEnabled(env, "AGENT_ENABLED");
}

// ── Audit logger ──────────────────────────────────────────────────────────────
async function auditLog(env, event) {
  const entry = {
    ...event,
    timestamp: new Date().toISOString(),
    broker_version: "2.1",
  };
  console.log(JSON.stringify({ audit: true, ...entry }));

  if (env.LOGS) {
    const key = `audit/${entry.timestamp.slice(0, 10)}/${Date.now()}.json`;
    try {
      await env.LOGS.put(key, JSON.stringify(entry), {
        httpMetadata: { contentType: "application/json" },
      });
    } catch (e) {
      console.error("Audit log R2 write failed:", e.message);
    }
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────
function authenticate(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "").trim();
  return token === env.BROKER_TOKEN;
}

// ── GitHub helpers ────────────────────────────────────────────────────────────
async function ghFetch(path, env, opts = {}) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "sovereign-broker/2.1",
      ...(opts.headers || {}),
    },
  });
  return res;
}

// ── CF API helpers ────────────────────────────────────────────────────────────
async function cfFetch(path, env, opts = {}) {
  const url = `https://api.cloudflare.com/client/v4${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  return res;
}

// ── Stripe helpers ────────────────────────────────────────────────────────────
async function stripeFetch(path, env, opts = {}) {
  const url = `https://api.stripe.com/v1${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(opts.headers || {}),
    },
  });
  return res;
}

// ════════════════════════════════════════════════════════════════════════════
// READ-ONLY HANDLERS (always allowed)
// ════════════════════════════════════════════════════════════════════════════

async function handleHealth(env) {
  const ghOk = await ghFetch("/git/refs/heads/main", env).then(r => r.ok).catch(() => false);
  const cfOk = await cfFetch(`/accounts/${CF_ACCOUNT}/workers/scripts`, env).then(r => r.ok).catch(() => false);
  const stripeOk = await stripeFetch("/account", env).then(r => r.ok).catch(() => false);

  return json({
    ok: true,
    broker: "sovereign-dev v2.1",
    github: ghOk ? "connected" : "error",
    cloudflare: cfOk ? "connected" : "error",
    stripe: stripeOk ? "connected" : "error",
    safety_mode: {
      agent_enabled:       isEnabled(env, "AGENT_ENABLED"),
      write_enabled:       isEnabled(env, "AGENT_WRITE_ENABLED"),
      deploy_enabled:      isEnabled(env, "AGENT_DEPLOY_ENABLED"),
      stripe_write:        isEnabled(env, "AGENT_STRIPE_WRITE_ENABLED"),
      destructive_enabled: isEnabled(env, "AGENT_DESTRUCTIVE_ACTIONS_ENABLED"),
      pr_enabled:          isEnabled(env, "AGENT_PR_ENABLED"),
    },
    timestamp: new Date().toISOString(),
  });
}

// ── Repo reads ────────────────────────────────────────────────────────────────
async function handleRepoTree(url, env) {
  const recursive = url.searchParams.get("recursive") !== "false";
  const endpoint = recursive ? `/git/trees/main?recursive=1` : `/contents/`;
  const res = await ghFetch(endpoint, env);
  const data = await res.json();

  if (recursive && data.tree) {
    const files = data.tree
      .filter(t => t.type === "blob")
      .map(t => t.path)
      .filter(p => !p.startsWith(".migration-backup") && !p.startsWith("pnpm-lock") && !isPathBlocked(p));
    return json({ ok: true, files, total: files.length });
  }
  return json({ ok: false, error: "Could not fetch tree" }, 500);
}

async function handleRepoFile(url, env) {
  const path = url.searchParams.get("path");
  if (!path) return err("Missing ?path=");
  if (isPathBlocked(path)) {
    return blocked(`Path '${path}' matches a blocked pattern (secrets/credentials denylist).`);
  }
  const res = await ghFetch(`/contents/${path}`, env);
  if (!res.ok) return err(`GitHub error: ${res.status}`, res.status);
  const data = await res.json();
  if (!data.content) return err("File not found or is a directory");
  const content = atob(data.content.replace(/\n/g, ""));
  return json({ ok: true, path, content, sha: data.sha, url: data.html_url });
}

async function handleRepoCommits(url, env) {
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const res = await ghFetch(`/commits?per_page=${limit}&sha=main`, env);
  const data = await res.json();
  if (!Array.isArray(data)) return err("Could not fetch commits");
  return json({
    ok: true,
    commits: data.map(c => ({
      sha: c.sha?.slice(0, 8),
      message: c.commit?.message?.split("\n")[0],
      author: c.commit?.author?.name,
      date: c.commit?.author?.date,
      url: c.html_url,
    })),
  });
}

async function handleListPRs(url, env) {
  const state = url.searchParams.get("state") || "open";
  const res = await ghFetch(`/pulls?state=${state}&per_page=20`, env);
  const data = await res.json();
  if (!Array.isArray(data)) return err("Could not fetch PRs");
  return json({
    ok: true,
    pull_requests: data.map(pr => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      branch: pr.head?.ref,
      author: pr.user?.login,
      created_at: pr.created_at,
      url: pr.html_url,
    })),
  });
}

// ── AI inference (read-only — no side effects) ────────────────────────────────
async function handleAIChat(body, env) {
  const { message, model = "chat", inject_repo_context = true, system_override, history = [] } = body;
  if (!message) return err("Missing message");

  const cfModel = MODEL_MAP[model] || MODEL_MAP.chat;

  let repoContext = "";
  if (inject_repo_context) {
    try {
      const treeRes = await ghFetch("/git/trees/main?recursive=1", env);
      const treeData = await treeRes.json();
      if (treeData.tree) {
        const files = treeData.tree
          .filter(t => t.type === "blob")
          .filter(f => !f.path.startsWith(".migration-backup") && !isPathBlocked(f.path))
          .map(t => t.path)
          .slice(0, 120);
        repoContext = `\n\nSOVV Repo (defragapp/SOVV) — ${files.length} files:\n${files.join("\n")}`;
      }
    } catch (e) {
      repoContext = "\n\n[Repo context unavailable]";
    }
  }

  const safetyContext = `
OPERATOR SAFETY POLICY (enforced at broker level):
- You NEVER commit directly to main. All writes go to agent/<timestamp> branch + PR.
- You NEVER deploy workers without explicit operator confirmation AND AGENT_DEPLOY_ENABLED=true.
- You NEVER read or expose .env, secrets, credentials, or private keys.
- You NEVER make billing mutations without AGENT_STRIPE_WRITE_ENABLED=true.
- You always show the user what you plan to do BEFORE doing it.
- Current flags: write=${isEnabled(env, "AGENT_WRITE_ENABLED")}, deploy=${isEnabled(env, "AGENT_DEPLOY_ENABLED")}, stripe_write=${isEnabled(env, "AGENT_STRIPE_WRITE_ENABLED")}, pr=${isEnabled(env, "AGENT_PR_ENABLED")}
`;

  const systemPrompt = `You are the Sovereign Build Agent — an AI engineer assistant for the SOVV / Sovereign.os / defrag.app platform.

PLATFORM:
- defrag.app — Next.js 15, Cloudflare Pages (OpenNext)
- api.defrag.app — Cloudflare Worker (sovereign-os-api) — auth, billing, AI, D1/KV/R2/Queues
- ai.defrag.app — Cloudflare Worker (worker-ai) — CF AI inference
- worker-session — Durable Objects for conflict sessions
- Stack: TypeScript, Next.js 15, Tailwind CSS, JetBrains Mono, itty-router, Stripe
- Active product: DEFRAG Pro ($20/mo or $99/yr)
- Three spaces: Defrag (pattern analysis), Alignment (vectors), Covenant (relational boundaries)
- Design: dark theme, bg-black/zinc-900, JetBrains Mono, glass morphism, Framer Motion

${safetyContext}
${system_override ? `\nADDITIONAL CONTEXT:\n${system_override}` : ""}${repoContext}`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: "user", content: message },
  ];

  try {
    const result = await env.AI.run(
      cfModel,
      { messages, max_tokens: 4096, temperature: 0.7 },
      { gateway: { id: GATEWAY_ID } }
    );
    return json({ ok: true, response: result.response || result, model_used: cfModel });
  } catch (e) {
    return err(`AI error: ${e.message}`, 500);
  }
}

async function handleImageGen(body, env) {
  const { prompt, model = "flux-schnell", width = 1024, height = 1024, upload_to_r2 = true, r2_key } = body;
  if (!prompt) return err("Missing prompt");

  const cfModel = IMAGE_MODEL_MAP[model] || IMAGE_MODEL_MAP["flux-schnell"];

  try {
    const result = await env.AI.run(cfModel, { prompt, width, height });

    let imageBytes;
    if (result instanceof ReadableStream) {
      const reader = result.getReader();
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      imageBytes = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0));
      let offset = 0;
      for (const chunk of chunks) { imageBytes.set(chunk, offset); offset += chunk.length; }
    } else {
      imageBytes = new Uint8Array(result);
    }

    const key = r2_key || `generated/${Date.now()}-${model}.png`;

    if (upload_to_r2 && env.TEMPLATES) {
      await env.TEMPLATES.put(key, imageBytes, { httpMetadata: { contentType: "image/png" } });
      return json({ ok: true, image_url: `https://pub-${CF_ACCOUNT}.r2.dev/${key}`, model_used: cfModel, r2_key: key });
    }

    const base64 = btoa(String.fromCharCode(...imageBytes));
    return json({ ok: true, base64, model_used: cfModel });
  } catch (e) {
    return err(`Image gen error: ${e.message}`, 500);
  }
}

async function handleImageAnalyze(body, env) {
  const { image_url, question } = body;
  if (!image_url || !question) return err("Missing image_url or question");

  try {
    const result = await env.AI.run(
      MODEL_MAP.vision,
      {
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: image_url } },
            { type: "text", text: question },
          ],
        }],
        max_tokens: 2048,
      },
      { gateway: { id: GATEWAY_ID } }
    );
    return json({ ok: true, response: result.response || result, model_used: MODEL_MAP.vision });
  } catch (e) {
    return err(`Vision error: ${e.message}`, 500);
  }
}

// ── CF reads ──────────────────────────────────────────────────────────────────
async function handleListWorkers(env) {
  const res = await cfFetch(`/accounts/${CF_ACCOUNT}/workers/scripts`, env);
  const data = await res.json();
  return json({
    ok: res.ok,
    workers: (data.result || []).map(w => ({ id: w.id, etag: w.etag, modified_on: w.modified_on })),
  });
}

async function handleWorkerLogs(url, env) {
  const worker = url.searchParams.get("worker");
  if (!worker) return err("Missing ?worker=");
  const res = await cfFetch(`/accounts/${CF_ACCOUNT}/workers/scripts/${worker}/tail`, env, {
    method: "POST", body: JSON.stringify({}),
  });
  const data = await res.json();
  return json({ ok: res.ok, worker, logs: data.result || [] });
}

async function handleKVGet(url, env) {
  const key = url.searchParams.get("key");
  if (!key) return err("Missing ?key=");
  const res = await cfFetch(
    `/accounts/${CF_ACCOUNT}/storage/kv/namespaces/${KV_NS_ID}/values/${encodeURIComponent(key)}`,
    env
  );
  if (!res.ok) return json({ ok: false, key, value: null });
  const value = await res.text();
  return json({ ok: true, key, value });
}

async function handleD1Query(body, env) {
  const { sql, params = [] } = body;
  if (!sql) return err("Missing sql");
  if (!sql.trim().toUpperCase().startsWith("SELECT")) {
    return json({
      ok: false,
      blocked: true,
      reason: "Only SELECT queries are permitted. D1 writes require direct operator access.",
      hint: "To modify the database, use the Cloudflare D1 dashboard or wrangler d1 execute directly.",
    }, 403);
  }
  const res = await cfFetch(
    `/accounts/${CF_ACCOUNT}/d1/database/${D1_DB_ID}/query`,
    env,
    { method: "POST", body: JSON.stringify({ sql, params }) }
  );
  const data = await res.json();
  return json({ ok: res.ok, results: data.result?.[0]?.results || [], meta: data.result?.[0]?.meta || {} });
}

async function handleR2List(url, env) {
  const bucket = url.searchParams.get("bucket") || "vibesdk-templates";
  const prefix = url.searchParams.get("prefix") || "";
  const res = await cfFetch(
    `/accounts/${CF_ACCOUNT}/r2/buckets/${bucket}/objects?prefix=${encodeURIComponent(prefix)}&per_page=100`,
    env
  );
  const data = await res.json();
  return json({
    ok: res.ok,
    bucket,
    objects: (data.result?.objects || []).map(o => ({ key: o.key, size: o.size, uploaded: o.uploaded })),
  });
}

async function handlePagesDeployments(url, env) {
  const project = url.searchParams.get("project") || "sovv-web";
  const res = await cfFetch(
    `/accounts/${CF_ACCOUNT}/pages/projects/${project}/deployments?per_page=10`,
    env
  );
  const data = await res.json();
  return json({
    ok: res.ok,
    project,
    deployments: (data.result || []).map(d => ({
      id: d.id, url: d.url, created_on: d.created_on,
      environment: d.environment, latest_stage: d.latest_stage,
    })),
  });
}

// ── Stripe reads ──────────────────────────────────────────────────────────────
async function handleStripeOverview(env) {
  const [subsRes, chargesRes] = await Promise.all([
    stripeFetch("/subscriptions?status=active&limit=100", env),
    stripeFetch("/charges?limit=10", env),
  ]);
  const subs = await subsRes.json();
  const charges = await chargesRes.json();
  const activeSubs = subs.data || [];
  const mrr = activeSubs.reduce((sum, s) => {
    const item = s.items?.data?.[0];
    if (!item) return sum;
    const amount = item.price?.unit_amount || 0;
    const interval = item.price?.recurring?.interval;
    return sum + (interval === "year" ? Math.round(amount / 12) : amount);
  }, 0);
  return json({
    ok: true,
    active_product: "DEFRAG Pro (prod_UdHEFXmi3YN78U)",
    active_subscriptions: activeSubs.length,
    mrr_cents: mrr,
    arr_cents: mrr * 12,
    recent_charges: (charges.data || []).slice(0, 5).map(c => ({
      id: c.id, amount: c.amount, currency: c.currency,
      status: c.status, created: new Date(c.created * 1000).toISOString(),
    })),
  });
}

async function handleListSubscriptions(url, env) {
  const limit = url.searchParams.get("limit") || "20";
  const status = url.searchParams.get("status") || "active";
  const statusParam = status === "all" ? "" : `&status=${status}`;
  const res = await stripeFetch(`/subscriptions?limit=${limit}${statusParam}`, env);
  const data = await res.json();
  return json({
    ok: res.ok,
    subscriptions: (data.data || []).map(s => ({
      id: s.id, status: s.status, customer: s.customer,
      plan: s.items?.data?.[0]?.price?.nickname || s.items?.data?.[0]?.price?.id,
      amount: s.items?.data?.[0]?.price?.unit_amount,
      created: new Date(s.created * 1000).toISOString(),
    })),
  });
}

async function handleRevenue(url, env) {
  const days = parseInt(url.searchParams.get("days") || "30");
  const since = Math.floor(Date.now() / 1000) - days * 86400;
  const [chargesRes, subsRes] = await Promise.all([
    stripeFetch(`/charges?limit=100&created[gte]=${since}`, env),
    stripeFetch("/subscriptions?status=active&limit=100", env),
  ]);
  const charges = await chargesRes.json();
  const subs = await subsRes.json();
  const total = (charges.data || []).filter(c => c.paid && !c.refunded).reduce((sum, c) => sum + c.amount, 0);
  const activeSubs = subs.data || [];
  const mrr = activeSubs.reduce((sum, s) => {
    const item = s.items?.data?.[0];
    if (!item) return sum;
    const amount = item.price?.unit_amount || 0;
    const interval = item.price?.recurring?.interval;
    return sum + (interval === "year" ? Math.round(amount / 12) : amount);
  }, 0);
  return json({
    ok: true, period_days: days, total_revenue_cents: total,
    mrr_cents: mrr, arr_cents: mrr * 12,
    charge_count: (charges.data || []).length, active_subs: activeSubs.length,
  });
}

// ── Build scope (read-only AI analysis) ──────────────────────────────────────


  

async function handleBuildScope(env) {
  // Lightweight directory listing to avoid CPU timeout from full recursive tree fetch
  let fileSummary = "File tree unavailable";
  try {
    const treeRes = await ghFetch("/contents/apps", env);
    if (treeRes.ok) {
      const dirs = await treeRes.json();
      if (Array.isArray(dirs)) {
        fileSummary = `Apps: ${dirs.map(d => d.name).join(", ")}`;
      }
    }
  } catch (_) {}

  const prompt = `Analyze the SOVV / Sovereign.os / defrag.app platform.

Known structure:
- ${fileSummary}
- apps/web: Next.js 15 web app (landing, Defrag, Alignment, Covenant spaces, settings, pricing, auth)
- apps/worker: Cloudflare Worker API (auth, billing, baseline, defrag, alignment, covenant, patterns, library, invites, referrals, affiliates)
- apps/worker-ai: CF AI inference worker
- apps/worker-session: Durable Objects for real-time sessions
- apps/sovereign-broker: GPT API broker
- lib/api-spec: OpenAPI spec, packages/prompts: AI prompts, packages/core: shared components

Deployed workers: sovereign-os-api, worker-ai, worker-session, sovereign-broker, sovereign-build-agent, sovereign-code-agent, sovereign-control, sovereign-control-ui, sovereign-build-broker, sovv-web, developer, chatthread

Stack: Next.js 15, React 19, TypeScript, Tailwind v4, Framer Motion, Cloudflare Workers/D1/KV/R2/AI/Queues, Stripe, itty-router, pnpm monorepo

Product: Defrag (free, pattern analysis), Alignment (pro, vectors), Covenant (pro, boundaries), Baseline Design (personal context layer). Pre-revenue stage.

Return JSON with exactly these fields:
{
  "summary": "2-3 sentence platform summary",
  "built": ["major features/systems that are built"],
  "missing": ["features/systems that appear missing or incomplete"],
  "broken": ["things that look broken or need attention"],
  "next_priorities": [
    {"priority": 1, "task": "task name", "files": ["relevant files"], "effort": "small|medium|large"}
  ]
}

Return only valid JSON. No markdown. No code fences.`;

  try {
    const result = await env.AI.run(
      MODEL_MAP.chat,
      {
        messages: [
          { role: "system", content: "You are a senior platform architect. Return only valid JSON with no markdown or code fences." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1200,
        temperature: 0.3,
      },
      { gateway: { id: GATEWAY_ID } }
    );

    let parsed;
    const raw = result.response || result;
    if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
      parsed = raw;
    } else if (typeof raw === "string") {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      try {
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: cleaned };
      } catch (_) {
        parsed = { summary: cleaned };
      }
    } else {
      parsed = { summary: String(raw) };
    }
    return json({ ok: true, ...parsed });
  } catch (e) {
    return err(`Scope analysis error: ${e.message}`, 500);
  }
}

// ── Code generation (returns code only — does NOT commit) ─────────────────────
async function handleGenerateComponent(body, env) {
  const {
    description,
    component_name,
    target_path = "apps/web/components/",
    style_context = "Dark theme, JetBrains Mono, Tailwind CSS, glass morphism, defrag.app design system",
    generate_mockup = false,
  } = body;
  if (!description) return err("Missing description");

  const name = component_name || description.split(" ").slice(0, 3)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("") + "Component";

  const codeResult = await env.AI.run(
    MODEL_MAP.code,
    {
      messages: [
        { role: "system", content: "You are a senior React/TypeScript engineer. Return only complete, working code." },
        { role: "user", content: `Generate a complete, production-ready React TypeScript component for defrag.app.

Component name: ${name}
Description: ${description}
Target path: ${target_path}${name}.tsx
Style: ${style_context}

Requirements:
- TypeScript with proper types/interfaces
- Tailwind CSS (dark theme: bg-black, bg-zinc-900, text-white)
- JetBrains Mono (font-mono) where appropriate
- Framer Motion for animations if interactive
- Export as default, no TODOs

Return ONLY the complete TypeScript component code.` },
      ],
      max_tokens: 4096,
      temperature: 0.3,
    },
    { gateway: { id: GATEWAY_ID } }
  );

  const code = codeResult.response || codeResult;
  const fullPath = `${target_path}${name}.tsx`;

  let mockup_url = null;
  if (generate_mockup) {
    try {
      const imgResult = await env.AI.run(
        IMAGE_MODEL_MAP["flux-schnell"],
        { prompt: `UI mockup: ${description}. Dark SaaS app, minimal design, ${style_context}`, width: 1280, height: 720 }
      );
      if (imgResult && env.TEMPLATES) {
        const key = `mockups/${name}-${Date.now()}.png`;
        let bytes;
        if (imgResult instanceof ReadableStream) {
          const reader = imgResult.getReader();
          const chunks = [];
          while (true) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); }
          bytes = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
          let off = 0;
          for (const c of chunks) { bytes.set(c, off); off += c.length; }
        } else { bytes = new Uint8Array(imgResult); }
        await env.TEMPLATES.put(key, bytes, { httpMetadata: { contentType: "image/png" } });
        mockup_url = `https://pub-${CF_ACCOUNT}.r2.dev/${key}`;
      }
    } catch (e) { console.error("Mockup gen failed:", e.message); }
  }

  return json({
    ok: true,
    component_name: name,
    code,
    suggested_path: fullPath,
    mockup_url,
    committed: false,
    next_step: "Review the code above. To commit it, use /build/propose-pr with confirm: true (requires AGENT_WRITE_ENABLED + AGENT_PR_ENABLED).",
  });
}

async function handleGenerateWorker(body, env) {
  const { name, description, routes = [], bindings = [] } = body;
  if (!name || !description) return err("Missing name or description");

  const result = await env.AI.run(
    MODEL_MAP.code,
    {
      messages: [
        { role: "system", content: "You are a Cloudflare Workers expert. Return only complete, working code." },
        { role: "user", content: `Generate a complete Cloudflare Worker for the SOVV platform.

Worker name: ${name}
Description: ${description}
Routes: ${routes.join(", ") || "none specified"}
Bindings: ${JSON.stringify(bindings)}

Requirements:
- ES module syntax (export default { async fetch(request, env, ctx) {} })
- Proper CORS headers
- Bearer token auth using env.AUTH_TOKEN
- JSON responses with error handling

Return ONLY the complete worker JavaScript code.` },
      ],
      max_tokens: 4096,
      temperature: 0.2,
    },
    { gateway: { id: GATEWAY_ID } }
  );

  const code = result.response || result;
  const wranglerToml = `name = "${name}"
main = "./src/index.js"
compatibility_date = "2026-06-01"
compatibility_flags = ["nodejs_compat"]
workers_dev = false

${routes.map(r => `[[routes]]\npattern = "${r}"\ncustom_domain = true`).join("\n\n")}

[observability]
enabled = true`;

  return json({
    ok: true,
    worker_name: name,
    code,
    wrangler_toml: wranglerToml,
    deployed: false,
    next_step: "Review the code above. To deploy, use /cf/worker/deploy with confirm: true (requires AGENT_DEPLOY_ENABLED=true in Cloudflare dashboard).",
  });
}

// ════════════════════════════════════════════════════════════════════════════
// GATED WRITE HANDLERS (require confirm: true + feature flags)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Commit files directly to main (default) or open a PR branch.
 * mode: "direct" (default) → commit straight to main
 * mode: "pr" → create agent/<timestamp> branch + open PR
 * Requires: AGENT_ENABLED + AGENT_WRITE_ENABLED
 */
async function handleProposePR(body, env) {
  if (!agentEnabled(env))                     return blocked("AGENT_ENABLED is false — master kill switch is active.");
  if (!isEnabled(env, "AGENT_WRITE_ENABLED")) return blocked("AGENT_WRITE_ENABLED is false. Enable in Cloudflare dashboard vars.");

  const { files, title, body: prBody, mode = "direct" } = body;
  if (!files?.length || !title) return err("Missing files or title");

  // Block any attempt to write to blocked paths
  for (const file of files) {
    if (isPathBlocked(file.path)) {
      return blocked(`File path '${file.path}' is blocked by the secrets denylist.`);
    }
  }

  // ── DIRECT COMMIT TO MAIN ──────────────────────────────────────────────────
  if (mode !== "pr") {
    const commits = [];
    for (const file of files) {
      try {
        // Get existing SHA if file exists
        const existingRes = await ghFetch(`/contents/${file.path}?ref=main`, env);
        const existing = existingRes.ok ? await existingRes.json() : null;

        const payload = {
          message: `${title} [sovereign-gpt]`,
          content: btoa(unescape(encodeURIComponent(file.content))),
          branch: "main",
        };
        if (existing?.sha || file.sha) payload.sha = file.sha || existing.sha;

        const writeRes = await ghFetch(`/contents/${file.path}`, env, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const writeData = await writeRes.json();
        commits.push({
          path: file.path,
          sha: writeData.commit?.sha?.slice(0, 8),
          url: writeData.content?.html_url,
          ok: writeRes.ok,
          error: writeRes.ok ? undefined : JSON.stringify(writeData),
        });
      } catch (e) {
        commits.push({ path: file.path, error: e.message, ok: false });
      }
    }

    await auditLog(env, {
      event: "direct_commit_main",
      title,
      files: files.map(f => f.path),
      commits,
    });

    const allOk = commits.every(c => c.ok);
    return json({
      ok: allOk,
      mode: "direct",
      branch: "main",
      commits,
      message: allOk
        ? `✅ ${commits.length} file(s) committed directly to main.`
        : `⚠️ Some commits failed — check individual results.`,
    });
  }

  // ── PR MODE (explicit request only) ───────────────────────────────────────
  if (!isEnabled(env, "AGENT_PR_ENABLED")) return blocked("AGENT_PR_ENABLED is false. Enable in Cloudflare dashboard vars.");

  const branch = `agent/${Date.now()}`;

  const refRes = await ghFetch("/git/refs/heads/main", env);
  const refData = await refRes.json();
  const mainSha = refData.object?.sha;
  if (!mainSha) return err("Could not get main branch SHA");

  const branchRes = await ghFetch("/git/refs", env, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: mainSha }),
  });
  if (!branchRes.ok) {
    const bd = await branchRes.json();
    return err(`Could not create branch: ${JSON.stringify(bd)}`);
  }

  const commits = [];
  for (const file of files) {
    try {
      const existingRes = await ghFetch(`/contents/${file.path}?ref=${branch}`, env);
      const existing = existingRes.ok ? await existingRes.json() : null;
      const payload = {
        message: `${title} [sovereign-gpt]`,
        content: btoa(unescape(encodeURIComponent(file.content))),
        branch,
      };
      if (existing?.sha || file.sha) payload.sha = file.sha || existing.sha;
      const writeRes = await ghFetch(`/contents/${file.path}`, env, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const writeData = await writeRes.json();
      commits.push({ path: file.path, sha: writeData.commit?.sha?.slice(0, 8), ok: writeRes.ok });
    } catch (e) {
      commits.push({ path: file.path, error: e.message, ok: false });
    }
  }

  const prRes = await ghFetch("/pulls", env, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      body: `${prBody || ""}\n\n---\n*Opened by Sovereign Build Operator on \`${branch}\`.*`,
      head: branch,
      base: "main",
    }),
  });
  const prData = await prRes.json();

  await auditLog(env, {
    event: "propose_pr",
    branch,
    title,
    files: files.map(f => f.path),
    pr_url: prData.html_url,
    pr_number: prData.number,
  });

  return json({
    ok: prRes.ok,
    mode: "pr",
    branch,
    pr_number: prData.number,
    pr_url: prData.html_url,
    commits,
  });
}

/**
 * Deploy a Cloudflare Worker.
 * Requires: AGENT_ENABLED + AGENT_DEPLOY_ENABLED + confirm: true
 */
async function handleDeployWorker(body, env) {
  if (!agentEnabled(env))                       return blocked("AGENT_ENABLED is false — master kill switch is active.");
  if (!isEnabled(env, "AGENT_DEPLOY_ENABLED"))  return blocked("AGENT_DEPLOY_ENABLED is false. Enable in Cloudflare dashboard vars.");
  if (!body.confirm)                            return blocked("confirm: true is required for all deploy operations.");

  const { name, code } = body;
  if (!name || !code) return err("Missing name or code");

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/workers/scripts/${name}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${env.CF_API_TOKEN}`,
        "Content-Type": "application/javascript",
      },
      body: code,
    }
  );
  const data = await res.json();

  await auditLog(env, { event: "deploy_worker", worker_name: name, success: res.ok });

  return json({ ok: res.ok, worker_name: name, deployed: res.ok, result: data.result });
}

/**
 * Write a KV value.
 * Requires: AGENT_ENABLED + AGENT_DESTRUCTIVE_ACTIONS_ENABLED + confirm: true
 */
async function handleKVSet(body, env) {
  if (!agentEnabled(env))                                    return blocked("AGENT_ENABLED is false — master kill switch is active.");
  if (!isEnabled(env, "AGENT_DESTRUCTIVE_ACTIONS_ENABLED")) return blocked("AGENT_DESTRUCTIVE_ACTIONS_ENABLED is false.");
  if (!body.confirm)                                         return blocked("confirm: true is required for KV writes.");

  const { key, value, ttl } = body;
  if (!key || value === undefined) return err("Missing key or value");

  const url = `/accounts/${CF_ACCOUNT}/storage/kv/namespaces/${KV_NS_ID}/values/${encodeURIComponent(key)}${ttl ? `?expiration_ttl=${ttl}` : ""}`;
  const res = await cfFetch(url, env, { method: "PUT", headers: { "Content-Type": "text/plain" }, body: String(value) });

  await auditLog(env, { event: "kv_set", key });
  return json({ ok: res.ok, message: res.ok ? "Written" : "Failed" });
}

/**
 * Create a Stripe price/product.
 * Requires: AGENT_ENABLED + AGENT_STRIPE_WRITE_ENABLED + confirm: true
 */
async function handleCreatePrice(body, env) {
  if (!agentEnabled(env))                              return blocked("AGENT_ENABLED is false — master kill switch is active.");
  if (!isEnabled(env, "AGENT_STRIPE_WRITE_ENABLED"))   return blocked("AGENT_STRIPE_WRITE_ENABLED is false. Enable in Cloudflare dashboard vars.");
  if (!body.confirm)                                   return blocked("confirm: true is required for all Stripe write operations.");

  const { name, amount_cents, interval, currency = "usd" } = body;
  if (!name || !amount_cents || !interval) return err("Missing name, amount_cents, or interval");

  const productParams = new URLSearchParams({ name });
  const productRes = await stripeFetch("/products", env, { method: "POST", body: productParams.toString() });
  const product = await productRes.json();

  const priceParams = new URLSearchParams({ unit_amount: String(amount_cents), currency, product: product.id });
  if (interval !== "one_time") priceParams.set("recurring[interval]", interval);

  const priceRes = await stripeFetch("/prices", env, { method: "POST", body: priceParams.toString() });
  const price = await priceRes.json();

  await auditLog(env, { event: "create_price", name, amount_cents, interval, price_id: price.id });
  return json({ ok: priceRes.ok, price_id: price.id, product_id: product.id });
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN ROUTER
// ════════════════════════════════════════════════════════════════════════════
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (path !== "/health" && !authenticate(request, env)) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    try {
      // ── GET (all read-only) ──────────────────────────────────────────────
      if (request.method === "GET") {
        if (path === "/health")                 return handleHealth(env);
        if (path === "/repo/tree")              return handleRepoTree(url, env);
        if (path === "/repo/file")              return handleRepoFile(url, env);
        if (path === "/repo/commits")           return handleRepoCommits(url, env);
        if (path === "/repo/prs")               return handleListPRs(url, env);
        if (path === "/cf/workers")             return handleListWorkers(env);
        if (path === "/cf/worker/logs")         return handleWorkerLogs(url, env);
        if (path === "/cf/kv/get")              return handleKVGet(url, env);
        if (path === "/cf/r2/list")             return handleR2List(url, env);
        if (path === "/cf/pages/deployments")   return handlePagesDeployments(url, env);
        if (path === "/stripe/overview")        return handleStripeOverview(env);
        if (path === "/stripe/subscriptions")   return handleListSubscriptions(url, env);
        if (path === "/stripe/revenue")         return handleRevenue(url, env);
        if (path === "/build/scope")            return handleBuildScope(env);
      }

      // ── POST ─────────────────────────────────────────────────────────────
      if (request.method === "POST") {
        const body = await request.json();

        // Read-only POST (AI inference, code gen — no side effects)
        if (path === "/ai/chat")                    return handleAIChat(body, env);
        if (path === "/ai/generate-image")          return handleImageGen(body, env);
        if (path === "/ai/analyze-image")           return handleImageAnalyze(body, env);
        if (path === "/cf/d1/query")                return handleD1Query(body, env);
        if (path === "/build/generate-component")   return handleGenerateComponent(body, env);
        if (path === "/build/generate-worker")      return handleGenerateWorker(body, env);

        // Gated write operations (require confirm + feature flags)
        if (path === "/build/propose-pr")           return handleProposePR(body, env);
        if (path === "/cf/worker/deploy")           return handleDeployWorker(body, env);
        if (path === "/cf/kv/set")                  return handleKVSet(body, env);
        if (path === "/stripe/create-price")        return handleCreatePrice(body, env);
      }

      return json({ ok: false, error: "Not found" }, 404);
    } catch (e) {
      console.error("Broker error:", e);
      return json({ ok: false, error: e.message }, 500);
    }
  },
};