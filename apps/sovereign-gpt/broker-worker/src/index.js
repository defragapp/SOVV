/**
 * sovereign-broker — Cloudflare Worker
 * The single API surface that the SOVV ChatGPT Custom GPT calls.
 * Routes: GitHub, Cloudflare API, Stripe, CF AI (chat + image), Build intelligence.
 *
 * Deploy: wrangler deploy --name sovereign-broker
 * Secrets: BROKER_TOKEN, GITHUB_TOKEN, CF_API_TOKEN, STRIPE_SECRET_KEY, CF_ACCOUNT_ID
 */

// ── Model map ────────────────────────────────────────────────────────────────
const MODEL_MAP = {
  chat:   "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  code:   "@cf/openai/gpt-oss-120b",
  vision: "@cf/meta/llama-3.2-11b-vision-instruct",
  fast:   "@cf/meta/llama-3.2-3b-instruct",
};

const IMAGE_MODEL_MAP = {
  "flux-schnell":  "@cf/black-forest-labs/flux-1-schnell",
  "flux-dev":      "@cf/black-forest-labs/flux-2-dev",
  "sdxl":          "@cf/stabilityai/stable-diffusion-xl-base-1.0",
  "sdxl-lightning":"@cf/bytedance/stable-diffusion-xl-lightning",
};

const REPO_OWNER = "defragapp";
const REPO_NAME  = "SOVV";
const CF_ACCOUNT = "8b1954d216d65077c6480d62583fe2c2";
const D1_DB_ID   = "c8c2fd8d-5297-46fc-8594-7629c8bad74d";
const KV_NS_ID   = "3bd3ff5048a8468e82c574d7d66045c3";
const GATEWAY_ID = "sovereign-ai-gateway";

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
      "User-Agent": "sovereign-broker/2.0",
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

// ── Route handlers ────────────────────────────────────────────────────────────

async function handleHealth(env) {
  // Quick ping each service
  const ghOk = await ghFetch("/git/refs/heads/main", env)
    .then(r => r.ok).catch(() => false);
  const cfOk = await cfFetch(`/accounts/${CF_ACCOUNT}/workers/scripts`, env)
    .then(r => r.ok).catch(() => false);
  const stripeOk = await stripeFetch("/account", env)
    .then(r => r.ok).catch(() => false);

  return json({
    ok: true,
    broker: "sovereign-broker v2.0",
    github: ghOk ? "connected" : "error",
    cloudflare: cfOk ? "connected" : "error",
    stripe: stripeOk ? "connected" : "error",
    timestamp: new Date().toISOString(),
  });
}

// ── Repo ─────────────────────────────────────────────────────────────────────
async function handleRepoTree(url, env) {
  const path = url.searchParams.get("path") || "";
  const recursive = url.searchParams.get("recursive") !== "false";
  const endpoint = recursive
    ? `/git/trees/main?recursive=1`
    : `/contents/${path}`;

  const res = await ghFetch(endpoint, env);
  const data = await res.json();

  if (recursive && data.tree) {
    const files = data.tree
      .filter(t => t.type === "blob")
      .map(t => t.path)
      .filter(p => !p.startsWith(".migration-backup") && !p.startsWith("pnpm-lock"));
    return json({ ok: true, files, total: files.length });
  }

  if (Array.isArray(data)) {
    return json({ ok: true, files: data.map(f => f.path), total: data.length });
  }

  return json({ ok: false, error: "Could not fetch tree", raw: data }, 500);
}

async function handleRepoFile(url, env) {
  const path = url.searchParams.get("path");
  if (!path) return err("Missing ?path=");

  const res = await ghFetch(`/contents/${path}`, env);
  if (!res.ok) return err(`GitHub error: ${res.status}`, res.status);

  const data = await res.json();
  if (!data.content) return err("File not found or is a directory");

  const content = atob(data.content.replace(/\n/g, ""));
  return json({ ok: true, path, content, sha: data.sha, url: data.html_url });
}

async function handleRepoWrite(body, env) {
  const { path, content, message, sha, branch = "main" } = body;
  if (!path || !content || !message) return err("Missing path, content, or message");

  const payload = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch,
  };
  if (sha) payload.sha = sha;

  const res = await ghFetch(`/contents/${path}`, env, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) return err(`GitHub write error: ${JSON.stringify(data)}`, res.status);

  return json({
    ok: true,
    commit_sha: data.commit?.sha,
    url: data.content?.html_url,
  });
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

// ── AI Chat ───────────────────────────────────────────────────────────────────
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
          .filter(p => !p.path.startsWith(".migration-backup"))
          .map(t => t.path)
          .slice(0, 120);
        repoContext = `\n\nSOVV Repo (defragapp/SOVV) — ${files.length} files:\n${files.join("\n")}`;
      }
    } catch (e) {
      repoContext = "\n\n[Repo context unavailable]";
    }
  }

  const systemPrompt = `You are the Sovereign Build Agent — an autonomous AI engineer for the SOVV / Sovereign.os / defrag.app platform.

PLATFORM OVERVIEW:
- defrag.app — production web app (Next.js 15, Cloudflare Pages via OpenNext)
- api.defrag.app — Cloudflare Worker (sovereign-os-api) — auth, billing, AI routing, D1 DB
- ai.defrag.app — Cloudflare Worker (worker-ai) — CF AI inference
- worker-session — Durable Objects for conflict sessions
- sovereign-build-agent — autonomous build/deploy agent
- sovereign-code-agent — code generation agent
- Stack: TypeScript, Next.js 15, Tailwind CSS, JetBrains Mono, Cloudflare D1/KV/R2/AI/Queues, Stripe, itty-router
- Active product: DEFRAG Pro ($20/mo or $99/yr) — prod_UdHEFXmi3YN78U
- Three core spaces: Defrag (pattern analysis), Alignment (vectors), Covenant (relational boundaries)

YOUR CAPABILITIES:
- Read/write any file in the SOVV GitHub repo
- Deploy Cloudflare Workers
- Query D1 database, read/write KV, upload to R2
- Generate React/TypeScript components
- Generate images/UI mockups via Flux/SDXL
- Read Stripe revenue, subscriptions, create prices
- Analyze screenshots with vision model

BEHAVIOR:
- Be direct, technical, and autonomous
- When asked to build something, produce complete, production-ready code
- Always reference actual file paths from the repo
- When switching to image/component generation, use the appropriate high-capability model
- Follow the existing code style: TypeScript strict, Tailwind, dark theme, JetBrains Mono font
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

    return json({
      ok: true,
      response: result.response || result,
      model_used: cfModel,
    });
  } catch (e) {
    return err(`AI error: ${e.message}`, 500);
  }
}

// ── Image Generation ──────────────────────────────────────────────────────────
async function handleImageGen(body, env) {
  const {
    prompt,
    model = "flux-schnell",
    width = 1024,
    height = 1024,
    upload_to_r2 = true,
    r2_key,
  } = body;

  if (!prompt) return err("Missing prompt");

  const cfModel = IMAGE_MODEL_MAP[model] || IMAGE_MODEL_MAP["flux-schnell"];

  try {
    const result = await env.AI.run(cfModel, { prompt, width, height });

    // result is a ReadableStream or ArrayBuffer of image bytes
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
      for (const chunk of chunks) {
        imageBytes.set(chunk, offset);
        offset += chunk.length;
      }
    } else {
      imageBytes = new Uint8Array(result);
    }

    const key = r2_key || `generated/${Date.now()}-${model}.png`;

    if (upload_to_r2 && env.TEMPLATES) {
      await env.TEMPLATES.put(key, imageBytes, {
        httpMetadata: { contentType: "image/png" },
      });

      return json({
        ok: true,
        image_url: `https://pub-${CF_ACCOUNT}.r2.dev/${key}`,
        model_used: cfModel,
        r2_key: key,
      });
    }

    // Return base64 if no R2
    const base64 = btoa(String.fromCharCode(...imageBytes));
    return json({ ok: true, base64, model_used: cfModel });
  } catch (e) {
    return err(`Image gen error: ${e.message}`, 500);
  }
}

// ── Vision Analysis ───────────────────────────────────────────────────────────
async function handleImageAnalyze(body, env) {
  const { image_url, question } = body;
  if (!image_url || !question) return err("Missing image_url or question");

  try {
    const result = await env.AI.run(
      MODEL_MAP.vision,
      {
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: image_url } },
              { type: "text", text: question },
            ],
          },
        ],
        max_tokens: 2048,
      },
      { gateway: { id: GATEWAY_ID } }
    );

    return json({ ok: true, response: result.response || result, model_used: MODEL_MAP.vision });
  } catch (e) {
    return err(`Vision error: ${e.message}`, 500);
  }
}

// ── Cloudflare Workers ────────────────────────────────────────────────────────
async function handleListWorkers(env) {
  const res = await cfFetch(`/accounts/${CF_ACCOUNT}/workers/scripts`, env);
  const data = await res.json();
  return json({
    ok: res.ok,
    workers: (data.result || []).map(w => ({
      id: w.id,
      etag: w.etag,
      modified_on: w.modified_on,
    })),
  });
}

async function handleDeployWorker(body, env) {
  const { name, code, bindings = [] } = body;
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
  return json({
    ok: res.ok,
    worker_name: name,
    deployed: res.ok,
    result: data.result,
  });
}

async function handleWorkerLogs(url, env) {
  const worker = url.searchParams.get("worker");
  if (!worker) return err("Missing ?worker=");

  // Use R2 logs bucket if available — read recent log objects
  const res = await cfFetch(
    `/accounts/${CF_ACCOUNT}/workers/scripts/${worker}/tail`,
    env,
    { method: "POST", body: JSON.stringify({}) }
  );
  const data = await res.json();
  return json({ ok: res.ok, worker, logs: data.result || [] });
}

// ── KV ────────────────────────────────────────────────────────────────────────
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

async function handleKVSet(body, env) {
  const { key, value, ttl } = body;
  if (!key || value === undefined) return err("Missing key or value");

  const url = `/accounts/${CF_ACCOUNT}/storage/kv/namespaces/${KV_NS_ID}/values/${encodeURIComponent(key)}${ttl ? `?expiration_ttl=${ttl}` : ""}`;
  const res = await cfFetch(url, env, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body: String(value),
  });

  return json({ ok: res.ok, message: res.ok ? "Written" : "Failed" });
}

// ── D1 ────────────────────────────────────────────────────────────────────────
async function handleD1Query(body, env) {
  const { sql, params = [] } = body;
  if (!sql) return err("Missing sql");

  // Safety: only allow SELECT
  if (!sql.trim().toUpperCase().startsWith("SELECT")) {
    return err("Only SELECT queries are allowed via this endpoint");
  }

  const res = await cfFetch(
    `/accounts/${CF_ACCOUNT}/d1/database/${D1_DB_ID}/query`,
    env,
    {
      method: "POST",
      body: JSON.stringify({ sql, params }),
    }
  );

  const data = await res.json();
  return json({
    ok: res.ok,
    results: data.result?.[0]?.results || [],
    meta: data.result?.[0]?.meta || {},
  });
}

// ── R2 ────────────────────────────────────────────────────────────────────────
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
    objects: (data.result?.objects || []).map(o => ({
      key: o.key,
      size: o.size,
      uploaded: o.uploaded,
    })),
  });
}

async function handleR2Upload(body, env) {
  const { key, content, content_type = "application/octet-stream", bucket = "vibesdk-templates" } = body;
  if (!key || !content) return err("Missing key or content");

  const bytes = Uint8Array.from(atob(content), c => c.charCodeAt(0));

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/r2/buckets/${bucket}/objects/${encodeURIComponent(key)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${env.CF_API_TOKEN}`,
        "Content-Type": content_type,
      },
      body: bytes,
    }
  );

  return json({
    ok: res.ok,
    key,
    url: `https://pub-${CF_ACCOUNT}.r2.dev/${key}`,
  });
}

// ── Pages ─────────────────────────────────────────────────────────────────────
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
      id: d.id,
      url: d.url,
      created_on: d.created_on,
      environment: d.environment,
      latest_stage: d.latest_stage,
    })),
  });
}

// ── Stripe ────────────────────────────────────────────────────────────────────
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
      id: c.id,
      amount: c.amount,
      currency: c.currency,
      status: c.status,
      created: new Date(c.created * 1000).toISOString(),
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
      id: s.id,
      status: s.status,
      customer: s.customer,
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

  const total = (charges.data || [])
    .filter(c => c.paid && !c.refunded)
    .reduce((sum, c) => sum + c.amount, 0);

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
    period_days: days,
    total_revenue_cents: total,
    mrr_cents: mrr,
    arr_cents: mrr * 12,
    charge_count: (charges.data || []).length,
    active_subs: activeSubs.length,
  });
}

async function handleCreatePrice(body, env) {
  const { name, amount_cents, interval, currency = "usd" } = body;
  if (!name || !amount_cents || !interval) return err("Missing name, amount_cents, or interval");

  // Create product first
  const productParams = new URLSearchParams({ name });
  const productRes = await stripeFetch("/products", env, {
    method: "POST",
    body: productParams.toString(),
  });
  const product = await productRes.json();

  // Create price
  const priceParams = new URLSearchParams({
    unit_amount: String(amount_cents),
    currency,
    product: product.id,
  });
  if (interval !== "one_time") {
    priceParams.set("recurring[interval]", interval);
  }

  const priceRes = await stripeFetch("/prices", env, {
    method: "POST",
    body: priceParams.toString(),
  });
  const price = await priceRes.json();

  return json({ ok: priceRes.ok, price_id: price.id, product_id: product.id });
}

// ── Build Intelligence ────────────────────────────────────────────────────────
async function handleBuildScope(env) {
  // Fetch repo tree
  const treeRes = await ghFetch("/git/trees/main?recursive=1", env);
  const treeData = await treeRes.json();
  const files = (treeData.tree || [])
    .filter(t => t.type === "blob")
    .filter(f => !f.path.startsWith(".migration-backup"))
    .map(t => t.path);

  // Ask AI to analyze scope
  const scopePrompt = `You are analyzing the SOVV / Sovereign.os / defrag.app platform codebase.

File tree (${files.length} files):
${files.join("\n")}

Known deployed workers: chatthread, developer, sovereign-broker, sovereign-build-agent, sovereign-build-broker, sovereign-code-agent, sovereign-control, sovereign-control-ui, sovereign-os-api, sovv-web, worker-ai, worker-session

Known stack: Next.js 15, Cloudflare Workers, D1, KV, R2, CF AI, Stripe, TypeScript, Tailwind, itty-router

Analyze and return JSON with these exact fields:
{
  "summary": "2-3 sentence platform summary",
  "built": ["list of major features/systems that are built"],
  "missing": ["list of features/systems that appear missing or incomplete"],
  "broken": ["list of things that look broken or need attention"],
  "next_priorities": [
    {"priority": 1, "task": "task name", "files": ["relevant files"], "effort": "small|medium|large"}
  ]
}

Return only valid JSON.`;

  try {
    const result = await env.AI.run(
      MODEL_MAP.code,
      {
        messages: [
          { role: "system", content: "You are a senior platform architect. Return only valid JSON." },
          { role: "user", content: scopePrompt },
        ],
        max_tokens: 2048,
      },
      { gateway: { id: GATEWAY_ID } }
    );

    const raw = result.response || result;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: raw };

    return json({ ok: true, ...parsed });
  } catch (e) {
    return err(`Scope analysis error: ${e.message}`, 500);
  }
}

async function handleBuildComponent(body, env) {
  const {
    description,
    component_name,
    target_path = "apps/web/components/",
    style_context = "Dark theme, JetBrains Mono font, Tailwind CSS, glass morphism cards, defrag.app design system",
    generate_mockup = false,
    auto_commit = false,
  } = body;

  if (!description) return err("Missing description");

  const name = component_name || description.split(" ").slice(0, 3).map(w =>
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join("") + "Component";

  // Use high-capability code model
  const codePrompt = `Generate a complete, production-ready React TypeScript component for the defrag.app platform.

Component name: ${name}
Description: ${description}
Target path: ${target_path}${name}.tsx
Style context: ${style_context}

Requirements:
- TypeScript with proper types
- Tailwind CSS classes (dark theme, bg-black/bg-zinc-900, text-white)
- JetBrains Mono font where appropriate (font-mono)
- Framer Motion animations if interactive
- Follow existing component patterns from the codebase
- Export as default
- Include proper props interface
- Production-ready, no TODOs

Return ONLY the complete TypeScript component code, no explanation.`;

  const codeResult = await env.AI.run(
    MODEL_MAP.code,
    {
      messages: [
        { role: "system", content: "You are a senior React/TypeScript engineer. Return only complete, working code." },
        { role: "user", content: codePrompt },
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
        {
          prompt: `UI mockup of: ${description}. Dark theme, modern SaaS app, clean minimal design, ${style_context}`,
          width: 1280,
          height: 720,
        }
      );

      if (imgResult && env.TEMPLATES) {
        const key = `mockups/${name}-${Date.now()}.png`;
        let bytes;
        if (imgResult instanceof ReadableStream) {
          const reader = imgResult.getReader();
          const chunks = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          bytes = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
          let off = 0;
          for (const c of chunks) { bytes.set(c, off); off += c.length; }
        } else {
          bytes = new Uint8Array(imgResult);
        }
        await env.TEMPLATES.put(key, bytes, { httpMetadata: { contentType: "image/png" } });
        mockup_url = `https://pub-${CF_ACCOUNT}.r2.dev/${key}`;
      }
    } catch (e) {
      console.error("Mockup gen failed:", e.message);
    }
  }

  let committed = false;
  let commit_sha = null;

  if (auto_commit) {
    try {
      const writeRes = await ghFetch(`/contents/${fullPath}`, env, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `feat: add ${name} component [sovereign-gpt]`,
          content: btoa(unescape(encodeURIComponent(code))),
          branch: "main",
        }),
      });
      const writeData = await writeRes.json();
      committed = writeRes.ok;
      commit_sha = writeData.commit?.sha?.slice(0, 8);
    } catch (e) {
      console.error("Auto-commit failed:", e.message);
    }
  }

  return json({
    ok: true,
    component_name: name,
    code,
    target_path: fullPath,
    mockup_url,
    committed,
    commit_sha,
  });
}

async function handleBuildWorker(body, env) {
  const { name, description, routes = [], bindings = [], auto_deploy = false } = body;
  if (!name || !description) return err("Missing name or description");

  const workerPrompt = `Generate a complete Cloudflare Worker for the SOVV platform.

Worker name: ${name}
Description: ${description}
Routes: ${routes.join(", ") || "none specified"}
Bindings needed: ${JSON.stringify(bindings)}

Requirements:
- Modern ES module syntax (export default { async fetch(request, env, ctx) {} })
- Proper CORS headers
- Bearer token auth check using env.AUTH_TOKEN
- JSON responses
- Error handling
- Follow SOVV worker patterns (itty-router style or direct routing)
- Include wrangler.toml configuration as a comment block at the top

Return ONLY the complete worker JavaScript code.`;

  const result = await env.AI.run(
    MODEL_MAP.code,
    {
      messages: [
        { role: "system", content: "You are a Cloudflare Workers expert. Return only complete, working code." },
        { role: "user", content: workerPrompt },
      ],
      max_tokens: 4096,
      temperature: 0.2,
    },
    { gateway: { id: GATEWAY_ID } }
  );

  const code = result.response || result;

  // Generate wrangler.toml
  const wranglerToml = `name = "${name}"
main = "./src/index.js"
compatibility_date = "2026-06-01"
compatibility_flags = ["nodejs_compat"]
workers_dev = false

${routes.map(r => `[[routes]]\npattern = "${r}"\ncustom_domain = true`).join("\n\n")}

[observability]
enabled = true`;

  let deployed = false;
  if (auto_deploy) {
    try {
      const deployRes = await fetch(
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
      deployed = deployRes.ok;
    } catch (e) {
      console.error("Auto-deploy failed:", e.message);
    }
  }

  return json({ ok: true, worker_name: name, code, wrangler_toml: wranglerToml, deployed });
}

async function handleCommitBuild(body, env) {
  const { files, message, trigger_deploy = false } = body;
  if (!files?.length || !message) return err("Missing files or message");

  const commits = [];

  for (const file of files) {
    try {
      // Check if file exists (get SHA)
      const existingRes = await ghFetch(`/contents/${file.path}`, env);
      const existing = existingRes.ok ? await existingRes.json() : null;

      const payload = {
        message: `${message} [sovereign-gpt]`,
        content: btoa(unescape(encodeURIComponent(file.content))),
        branch: "main",
      };
      if (existing?.sha || file.sha) {
        payload.sha = file.sha || existing.sha;
      }

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
      });
    } catch (e) {
      commits.push({ path: file.path, error: e.message, ok: false });
    }
  }

  // Trigger deploy via workflow dispatch if requested
  let deploy_triggered = false;
  if (trigger_deploy) {
    try {
      const dispatchRes = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/deploy-production-web.yml/dispatches`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
            "User-Agent": "sovereign-broker/2.0",
          },
          body: JSON.stringify({ ref: "main" }),
        }
      );
      deploy_triggered = dispatchRes.ok;
    } catch (e) {
      console.error("Deploy dispatch failed:", e.message);
    }
  }

  return json({ ok: true, commits, deploy_triggered });
}

// ── Main router ───────────────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Auth (skip for health)
    if (path !== "/health" && !authenticate(request, env)) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    try {
      // GET routes
      if (request.method === "GET") {
        if (path === "/health")              return handleHealth(env);
        if (path === "/repo/tree")           return handleRepoTree(url, env);
        if (path === "/repo/file")           return handleRepoFile(url, env);
        if (path === "/repo/commits")        return handleRepoCommits(url, env);
        if (path === "/cf/workers")          return handleListWorkers(env);
        if (path === "/cf/worker/logs")      return handleWorkerLogs(url, env);
        if (path === "/cf/kv/get")           return handleKVGet(url, env);
        if (path === "/cf/d1/query")         return handleD1Query(await request.json(), env);
        if (path === "/cf/r2/list")          return handleR2List(url, env);
        if (path === "/cf/pages/deployments") return handlePagesDeployments(url, env);
        if (path === "/stripe/overview")     return handleStripeOverview(env);
        if (path === "/stripe/subscriptions") return handleListSubscriptions(url, env);
        if (path === "/stripe/revenue")      return handleRevenue(url, env);
        if (path === "/build/scope")         return handleBuildScope(env);
      }

      // POST routes
      if (request.method === "POST") {
        const body = await request.json();
        if (path === "/repo/write")          return handleRepoWrite(body, env);
        if (path === "/ai/chat")             return handleAIChat(body, env);
        if (path === "/ai/generate-image")   return handleImageGen(body, env);
        if (path === "/ai/analyze-image")    return handleImageAnalyze(body, env);
        if (path === "/cf/worker/deploy")    return handleDeployWorker(body, env);
        if (path === "/cf/kv/set")           return handleKVSet(body, env);
        if (path === "/cf/r2/upload")        return handleR2Upload(body, env);
        if (path === "/stripe/create-price") return handleCreatePrice(body, env);
        if (path === "/build/component")     return handleBuildComponent(body, env);
        if (path === "/build/worker")        return handleBuildWorker(body, env);
        if (path === "/build/commit")        return handleCommitBuild(body, env);
      }

      return json({ ok: false, error: "Not found" }, 404);
    } catch (e) {
      console.error("Broker error:", e);
      return json({ ok: false, error: e.message }, 500);
    }
  },
};