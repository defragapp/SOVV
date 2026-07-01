type JsonValue = null | string | number | boolean | JsonValue[] | { [key: string]: JsonValue };

type UnknownRecord = Record<string, unknown>;

interface Env {
  OPERATOR_API_TOKEN: string;

  GITHUB_APP_ID?: string;
  GITHUB_INSTALLATION_ID?: string;
  GITHUB_PRIVATE_KEY?: string;

  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_ZONE_ID?: string;

  STRIPE_SECRET_KEY?: string;
}

const REPO_OWNER = "defragapp";
const REPO_NAME = "SOVV";
const REPO_FULL_NAME = `${REPO_OWNER}/${REPO_NAME}`;

const DEFAULT_CLOUDFLARE_ACCOUNT_ID = "8b1954d216d65077c6480d62583fe2c2";
const DEFAULT_ZONE_NAME = "defrag.app";

const IMPORTANT_WORKERS = [
  "sovv-web",
  "sovereign-os-api",
  "worker-ai",
  "worker-session",
  "sovereign-control",
  "sovereign-control-ui",
  "sovereign-build-agent",
  "sovereign-code-agent",
] as const;

const REPO_FILES_TO_PROBE = [
  "package.json",
  ".nvmrc",
  "README.md",
  "docs/ARCHITECTURE.md",
  "docs/SETUP_GUIDE.md",
  ".github/workflows/deploy.yml",
  ".github/workflows/ci.yml",
  "apps/worker/wrangler.toml",
  "apps/worker/wrangler.json",
  "apps/web/wrangler.toml",
  "apps/web/wrangler.json",
  "apps/worker-ai/wrangler.toml",
  "apps/worker-session/wrangler.toml",
];

const SECRETISH_KEYS = [
  "authorization",
  "api_key",
  "apikey",
  "access_token",
  "refresh_token",
  "token",
  "secret",
  "password",
  "private_key",
  "client_secret",
  "signing_secret",
  "webhook_secret",
  "key",
  "value",
  "text",
  "plain_text",
  "secret_text",
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    if (!env.OPERATOR_API_TOKEN) {
      return json({ error: "OPERATOR_API_TOKEN is not configured" }, 500);
    }

    const auth = request.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${env.OPERATOR_API_TOKEN}`) {
      return json({ error: "Unauthorized" }, 401);
    }

    const url = new URL(request.url);

    try {
      if (request.method !== "POST" && url.pathname !== "/health") {
        return json({ error: "Use POST for operator endpoints" }, 405);
      }

      switch (url.pathname) {
        case "/health":
          return json({ ok: true, service: "sovv-operator-api", mode: "read-only" });
        case "/state/audit":
          return json(await auditBusinessState(request, env));
        case "/github/repo-audit":
          return json(await auditRepository(env));
        case "/cloudflare/audit":
          return json(await auditCloudflare(request, env));
        case "/stripe/audit":
          return json(await auditStripe(request, env));
        default:
          return json({ error: "Not found" }, 404);
      }
    } catch (error) {
      return json(
        {
          error: "Operator request failed",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }
  },
};

async function auditBusinessState(request: Request, env: Env) {
  const body = await readJson(request);
  const includeGithub = body.include_github !== false;
  const includeCloudflare = body.include_cloudflare !== false;
  const includeStripe = body.include_stripe === true;

  const state: UnknownRecord = {
    verified_at: new Date().toISOString(),
    mode: "read-only",
    repo: REPO_FULL_NAME,
    cloudflare_account_id: env.CLOUDFLARE_ACCOUNT_ID ?? DEFAULT_CLOUDFLARE_ACCOUNT_ID,
    zone: DEFAULT_ZONE_NAME,
    production_mutation_enabled: false,
    write_routes_present: false,
  };

  if (includeGithub) {
    state.github = await auditRepository(env);
  }

  if (includeCloudflare) {
    state.cloudflare = await auditCloudflare(
      internalPost({ worker_names: [...IMPORTANT_WORKERS] }),
      env,
    );
  }

  if (includeStripe) {
    state.stripe = await auditStripe(internalPost({ mode: "test" }), env);
  }

  return state;
}

async function auditRepository(env: Env) {
  const configured = githubConfigured(env);
  if (!configured.ok) {
    return {
      status: "unconfigured",
      repo: REPO_FULL_NAME,
      missing: configured.missing,
      note: "Configure GitHub App credentials as Worker secrets. Do not paste tokens into the agent prompt.",
    };
  }

  const [repo, branches, openPulls, workflowRuns, latestRelease, packageJson, probedFiles] = await Promise.all([
    githubRequest(env, `/repos/${REPO_FULL_NAME}`),
    githubRequest(env, `/repos/${REPO_FULL_NAME}/branches?per_page=30`),
    githubRequest(env, `/repos/${REPO_FULL_NAME}/pulls?state=open&per_page=20`),
    githubRequest(env, `/repos/${REPO_FULL_NAME}/actions/runs?per_page=10`),
    githubRequest(env, `/repos/${REPO_FULL_NAME}/releases/latest`),
    readRepoJson(env, "package.json"),
    Promise.all(REPO_FILES_TO_PROBE.map((path) => readRepoFileMetadata(env, path))),
  ]);

  return {
    verified_at: new Date().toISOString(),
    status: "verified",
    repo: REPO_FULL_NAME,
    repository: summarizeRepo(repo),
    branches: summarizeList(branches, (branch) => ({
      name: stringField(branch, "name"),
      protected: booleanField(branch, "protected"),
    })),
    open_pull_requests: summarizeList(openPulls, (pull) => ({
      number: numberField(pull, "number"),
      title: stringField(pull, "title"),
      state: stringField(pull, "state"),
      draft: booleanField(pull, "draft"),
      head: nestedString(pull, ["head", "ref"]),
      base: nestedString(pull, ["base", "ref"]),
      url: stringField(pull, "html_url"),
    })),
    recent_workflow_runs: summarizeWorkflowRuns(workflowRuns),
    latest_release: summarizeRelease(latestRelease),
    package_manager: packageJson.ok
      ? {
          name: packageJson.json?.name,
          packageManager: packageJson.json?.packageManager,
          engines: packageJson.json?.engines,
          scripts: packageJson.json?.scripts,
          workspaces: packageJson.json?.workspaces,
        }
      : packageJson,
    probed_files: probedFiles,
    write_policy: {
      default: "disabled in this read-only façade",
      future_path: "Add branch/PR endpoints only after read-only audit is verified.",
    },
  };
}

async function auditCloudflare(request: Request, env: Env) {
  const body = await readJson(request);
  const accountId = env.CLOUDFLARE_ACCOUNT_ID ?? DEFAULT_CLOUDFLARE_ACCOUNT_ID;
  const workerNames = toStringArray(body.worker_names) ?? [...IMPORTANT_WORKERS];

  if (!env.CLOUDFLARE_API_TOKEN) {
    return {
      status: "unconfigured",
      account_id: accountId,
      missing: ["CLOUDFLARE_API_TOKEN"],
      note: "Configure Cloudflare access as a Worker secret. Do not paste tokens into the agent prompt.",
    };
  }

  const workerAudits = [];
  for (const workerName of workerNames) {
    const [settings, deployments] = await Promise.all([
      cloudflareRequest(env, `/accounts/${accountId}/workers/scripts/${encodeURIComponent(workerName)}/settings`),
      cloudflareRequest(env, `/accounts/${accountId}/workers/scripts/${encodeURIComponent(workerName)}/deployments`),
    ]);

    workerAudits.push({
      worker: workerName,
      settings: summarizeCloudflareResult(settings),
      deployments: summarizeCloudflareDeployments(deployments),
      bindings: extractBindings(settings),
    });
  }

  const [scripts, d1, kv, r2, queues, routes, dns, durableObjects, aiGateway] = await Promise.all([
    cloudflareRequest(env, `/accounts/${accountId}/workers/scripts`),
    cloudflareRequest(env, `/accounts/${accountId}/d1/database`),
    cloudflareRequest(env, `/accounts/${accountId}/storage/kv/namespaces`),
    cloudflareRequest(env, `/accounts/${accountId}/r2/buckets`),
    cloudflareRequest(env, `/accounts/${accountId}/queues`),
    env.CLOUDFLARE_ZONE_ID
      ? cloudflareRequest(env, `/zones/${env.CLOUDFLARE_ZONE_ID}/workers/routes`)
      : skipped("CLOUDFLARE_ZONE_ID not configured"),
    env.CLOUDFLARE_ZONE_ID
      ? cloudflareRequest(env, `/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records?per_page=100`)
      : skipped("CLOUDFLARE_ZONE_ID not configured"),
    cloudflareRequest(env, `/accounts/${accountId}/workers/durable_objects/namespaces`),
    cloudflareRequest(env, `/accounts/${accountId}/ai-gateway/gateways`),
  ]);

  return {
    verified_at: new Date().toISOString(),
    status: "verified",
    account_id: accountId,
    zone_name: DEFAULT_ZONE_NAME,
    important_workers: workerAudits,
    inventory: {
      scripts: summarizeNamedList(scripts, ["id", "script", "name"]),
      d1_databases: summarizeNamedList(d1, ["name", "uuid"]),
      kv_namespaces: summarizeNamedList(kv, ["title", "id"]),
      r2_buckets: summarizeNamedList(r2, ["name", "creation_date"]),
      queues: summarizeNamedList(queues, ["queue_name", "queue_id", "created_on"]),
      routes: summarizeNamedList(routes, ["pattern", "script", "id"]),
      dns_records: summarizeDnsRecords(dns),
      durable_objects: summarizeNamedList(durableObjects, ["name", "class", "script_name"]),
      ai_gateway: summarizeNamedList(aiGateway, ["id", "name"]),
    },
    policy_checks: {
      sovereign_os_api_db_binding: checkSovereignOsApiDbBinding(workerAudits),
      web_release_target: {
        expected_worker: "sovv-web",
        rule: "Web-only release must not touch unrelated Workers.",
      },
    },
    production_mutation_enabled: false,
  };
}

async function auditStripe(request: Request, env: Env) {
  const body = await readJson(request);
  const mode = stringField(body, "mode") ?? "test";
  const includeCustomers = body.include_customers === true;
  const includeSubscriptions = body.include_subscriptions === true;
  const includeInvoices = body.include_invoices === true;

  if (!env.STRIPE_SECRET_KEY) {
    return {
      status: "unconfigured",
      mode,
      missing: ["STRIPE_SECRET_KEY"],
      note: "Configure a restricted Stripe key as a Worker secret. Do not paste Stripe keys into the agent prompt.",
    };
  }

  const [products, prices, paymentLinks, webhooks, customers, subscriptions, invoices] = await Promise.all([
    stripeRequest(env, "/v1/products?limit=25"),
    stripeRequest(env, "/v1/prices?limit=25"),
    stripeRequest(env, "/v1/payment_links?limit=25"),
    stripeRequest(env, "/v1/webhook_endpoints?limit=25"),
    includeCustomers ? stripeRequest(env, "/v1/customers?limit=25") : skipped("customers not requested"),
    includeSubscriptions ? stripeRequest(env, "/v1/subscriptions?limit=25") : skipped("subscriptions not requested"),
    includeInvoices ? stripeRequest(env, "/v1/invoices?limit=25") : skipped("invoices not requested"),
  ]);

  return {
    verified_at: new Date().toISOString(),
    status: "verified",
    requested_mode: mode,
    commercial_state: {
      products: summarizeStripeList(products, ["id", "name", "active", "created"]),
      prices: summarizeStripeList(prices, ["id", "product", "active", "currency", "unit_amount", "recurring", "created"]),
      payment_links: summarizeStripeList(paymentLinks, ["id", "active", "url", "created"]),
      webhooks: summarizeStripeList(webhooks, ["id", "url", "enabled_events", "status", "created"]),
      customers: summarizeStripeList(customers, ["id", "email", "created"]),
      subscriptions: summarizeStripeList(subscriptions, ["id", "customer", "status", "current_period_end"]),
      invoices: summarizeStripeList(invoices, ["id", "customer", "status", "total", "currency", "created"]),
    },
    mutation_policy: "read-only; live commercial changes require explicit approval and a separate mutation route that is not present here",
  };
}

function internalPost(body: unknown): Request {
  return new Request("https://internal.operator.local", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

async function readJson(request: Request): Promise<UnknownRecord> {
  if (!request.body) return {};
  try {
    const parsed = await request.json();
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function json(data: unknown, status = 200): Response {
  return withCors(
    new Response(JSON.stringify(sanitizeForReport(data), null, 2), {
      status,
      headers: { "content-type": "application/json; charset=utf-8" },
    }),
  );
}

function withCors(response: Response): Response {
  response.headers.set("access-control-allow-origin", "*");
  response.headers.set("access-control-allow-methods", "GET,POST,OPTIONS");
  response.headers.set("access-control-allow-headers", "authorization,content-type");
  return response;
}

function githubConfigured(env: Env) {
  const missing = [
    ["GITHUB_APP_ID", env.GITHUB_APP_ID],
    ["GITHUB_INSTALLATION_ID", env.GITHUB_INSTALLATION_ID],
    ["GITHUB_PRIVATE_KEY", env.GITHUB_PRIVATE_KEY],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  return { ok: missing.length === 0, missing };
}

let cachedGithubToken: { token: string; expiresAt: number } | null = null;

async function getGithubInstallationToken(env: Env): Promise<string> {
  const now = Date.now();
  if (cachedGithubToken && cachedGithubToken.expiresAt - 60_000 > now) {
    return cachedGithubToken.token;
  }

  if (!githubConfigured(env).ok) {
    throw new Error("GitHub App credentials are not configured");
  }

  const jwt = await createGithubAppJwt(env);
  const res = await fetch(
    `https://api.github.com/app/installations/${env.GITHUB_INSTALLATION_ID}/access_tokens`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${jwt}`,
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        "user-agent": "sovv-operator-api",
      },
    },
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !isRecord(data) || typeof data.token !== "string") {
    throw new Error(`GitHub installation token request failed with HTTP ${res.status}`);
  }

  const expiresAt = typeof data.expires_at === "string" ? Date.parse(data.expires_at) : now + 45 * 60_000;
  cachedGithubToken = { token: data.token, expiresAt };
  return data.token;
}

async function createGithubAppJwt(env: Env): Promise<string> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iat: nowSeconds - 60,
    exp: nowSeconds + 9 * 60,
    iss: env.GITHUB_APP_ID,
  };

  const signingInput = `${base64UrlJson(header)}.${base64UrlJson(payload)}`;
  const key = await importPrivateKey(env.GITHUB_PRIVATE_KEY ?? "");
  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64UrlBytes(new Uint8Array(signature))}`;
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const normalized = pem.replace(/\\n/g, "\n");
  const base64 = normalized
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/-----BEGIN RSA PRIVATE KEY-----/g, "")
    .replace(/-----END RSA PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");

  const bytes = base64ToBytes(base64);
  return crypto.subtle.importKey(
    "pkcs8",
    bytes,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function githubRequest(env: Env, path: string, init: RequestInit = {}) {
  const token = await getGithubInstallationToken(env);
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "sovv-operator-api",
      ...(init.headers ?? {}),
    },
  });

  const data = await readResponseBody(res);
  return { ok: res.ok, status: res.status, data };
}

async function readRepoJson(env: Env, path: string) {
  const file = await readRepoFile(env, path);
  if (!file.ok || typeof file.text !== "string") return file;

  try {
    return { ...file, json: JSON.parse(file.text) as UnknownRecord, text: undefined };
  } catch {
    return { ...file, json_error: "File is not valid JSON", text: undefined };
  }
}

async function readRepoFileMetadata(env: Env, path: string) {
  const file = await readRepoFile(env, path);
  return {
    path,
    ok: file.ok,
    status: file.status,
    sha: file.sha,
    size: file.size,
    type: file.type,
  };
}

async function readRepoFile(env: Env, path: string) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const result = await githubRequest(env, `/repos/${REPO_FULL_NAME}/contents/${encodedPath}`);
  if (!result.ok || !isRecord(result.data)) {
    return { path, ok: false, status: result.status };
  }

  const content = typeof result.data.content === "string" ? result.data.content : null;
  const encoding = typeof result.data.encoding === "string" ? result.data.encoding : null;

  return {
    path,
    ok: true,
    status: result.status,
    sha: stringField(result.data, "sha"),
    size: numberField(result.data, "size"),
    type: stringField(result.data, "type"),
    text: content && encoding === "base64" ? base64ToUtf8(content) : undefined,
  };
}

async function cloudflareRequest(env: Env, path: string) {
  if (!env.CLOUDFLARE_API_TOKEN) return skipped("CLOUDFLARE_API_TOKEN not configured");

  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    headers: {
      authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      "content-type": "application/json",
    },
  });

  const data = await readResponseBody(res);
  return { ok: res.ok, status: res.status, data };
}

async function stripeRequest(env: Env, path: string) {
  if (!env.STRIPE_SECRET_KEY) return skipped("STRIPE_SECRET_KEY not configured");

  const res = await fetch(`https://api.stripe.com${path}`, {
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
  });

  const data = await readResponseBody(res);
  return { ok: res.ok, status: res.status, data };
}

async function readResponseBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return res.json().catch(() => null);
  }

  const text = await res.text().catch(() => "");
  return text.slice(0, 2_000);
}

function summarizeRepo(response: UnknownRecord) {
  if (!response.ok || !isRecord(response.data)) return response;
  const repo = response.data;
  return {
    id: numberField(repo, "id"),
    full_name: stringField(repo, "full_name"),
    default_branch: stringField(repo, "default_branch"),
    private: booleanField(repo, "private"),
    archived: booleanField(repo, "archived"),
    visibility: stringField(repo, "visibility"),
    pushed_at: stringField(repo, "pushed_at"),
    updated_at: stringField(repo, "updated_at"),
    html_url: stringField(repo, "html_url"),
  };
}

function summarizeList<T extends UnknownRecord>(response: UnknownRecord, mapper: (item: UnknownRecord) => T) {
  if (!response.ok || !Array.isArray(response.data)) return response;
  return response.data.filter(isRecord).map(mapper);
}

function summarizeWorkflowRuns(response: UnknownRecord) {
  if (!response.ok || !isRecord(response.data) || !Array.isArray(response.data.workflow_runs)) return response;
  return response.data.workflow_runs.filter(isRecord).map((run) => ({
    id: numberField(run, "id"),
    name: stringField(run, "name"),
    status: stringField(run, "status"),
    conclusion: stringField(run, "conclusion"),
    event: stringField(run, "event"),
    branch: stringField(run, "head_branch"),
    sha: stringField(run, "head_sha"),
    created_at: stringField(run, "created_at"),
    updated_at: stringField(run, "updated_at"),
    url: stringField(run, "html_url"),
  }));
}

function summarizeRelease(response: UnknownRecord) {
  if (!response.ok || !isRecord(response.data)) {
    return { ok: response.ok, status: response.status, available: false };
  }
  return {
    available: true,
    tag_name: stringField(response.data, "tag_name"),
    name: stringField(response.data, "name"),
    draft: booleanField(response.data, "draft"),
    prerelease: booleanField(response.data, "prerelease"),
    published_at: stringField(response.data, "published_at"),
    url: stringField(response.data, "html_url"),
  };
}

function summarizeCloudflareResult(response: UnknownRecord) {
  if (response.skipped) return response;
  if (!response.ok || !isRecord(response.data)) return response;
  const data = response.data;
  return {
    ok: response.ok,
    status: response.status,
    success: booleanField(data, "success"),
    errors: data.errors,
    messages: data.messages,
    result: sanitizeForReport(data.result),
  };
}

function summarizeCloudflareDeployments(response: UnknownRecord) {
  if (!response.ok || !isRecord(response.data)) return response;
  const result = response.data.result;
  const deployments = Array.isArray(result) ? result : isRecord(result) && Array.isArray(result.items) ? result.items : [];
  return deployments.filter(isRecord).slice(0, 5).map((deployment) => ({
    id: stringField(deployment, "id"),
    number: numberField(deployment, "number"),
    source: stringField(deployment, "source"),
    strategy: stringField(deployment, "strategy"),
    author_email: nestedString(deployment, ["author", "email"]),
    created_on: stringField(deployment, "created_on"),
    modified_on: stringField(deployment, "modified_on"),
  }));
}

function extractBindings(response: UnknownRecord) {
  if (!response.ok || !isRecord(response.data)) return [];
  const result = response.data.result;
  if (!isRecord(result)) return [];
  const bindings = Array.isArray(result.bindings) ? result.bindings : [];
  return bindings.filter(isRecord).map((binding) => ({
    name: stringField(binding, "name"),
    type: stringField(binding, "type"),
    namespace_id: stringField(binding, "namespace_id"),
    id: stringField(binding, "id"),
    database_id: stringField(binding, "database_id"),
    database_name: stringField(binding, "database_name"),
    bucket_name: stringField(binding, "bucket_name"),
    queue_name: stringField(binding, "queue_name"),
    class_name: stringField(binding, "class_name"),
    script_name: stringField(binding, "script_name"),
  }));
}

function checkSovereignOsApiDbBinding(workerAudits: UnknownRecord[]) {
  const api = workerAudits.find((worker) => worker.worker === "sovereign-os-api");
  if (!api || !Array.isArray(api.bindings)) {
    return {
      status: "unknown",
      expected: "DB binding targets sovereign-db",
      forbidden: "vibesdk-db",
      reason: "sovereign-os-api bindings were not available",
    };
  }

  const d1Bindings = api.bindings.filter((binding) => {
    if (!isRecord(binding)) return false;
    const name = stringField(binding, "name")?.toLowerCase();
    const type = stringField(binding, "type")?.toLowerCase();
    return name === "db" || type?.includes("d1") || Boolean(stringField(binding, "database_name"));
  });

  const evidence = d1Bindings.map((binding) => ({
    name: stringField(binding, "name"),
    type: stringField(binding, "type"),
    database_name: stringField(binding, "database_name"),
    database_id: stringField(binding, "database_id"),
  }));

  const evidenceText = JSON.stringify(evidence).toLowerCase();
  if (evidenceText.includes("vibesdk-db")) {
    return {
      status: "fail",
      expected: "sovereign-db",
      forbidden: "vibesdk-db",
      evidence,
    };
  }

  if (evidenceText.includes("sovereign-db")) {
    return {
      status: "pass",
      expected: "sovereign-db",
      forbidden: "vibesdk-db",
      evidence,
    };
  }

  return {
    status: "unknown",
    expected: "sovereign-db",
    forbidden: "vibesdk-db",
    evidence,
    reason: "D1 binding was found, but database name was not visible in the Cloudflare settings response.",
  };
}

function summarizeNamedList(response: UnknownRecord, fields: string[]) {
  if (response.skipped) return response;
  if (!response.ok || !isRecord(response.data)) return response;

  const result = response.data.result;
  const items = Array.isArray(result)
    ? result
    : isRecord(result) && Array.isArray(result.items)
      ? result.items
      : isRecord(result) && Array.isArray(result.result)
        ? result.result
        : [];

  return items.filter(isRecord).slice(0, 50).map((item) => {
    const out: UnknownRecord = {};
    for (const field of fields) out[field] = item[field];
    return sanitizeForReport(out);
  });
}

function summarizeDnsRecords(response: UnknownRecord) {
  if (response.skipped) return response;
  if (!response.ok || !isRecord(response.data)) return response;
  const result = response.data.result;
  const records = Array.isArray(result) ? result : [];
  return records.filter(isRecord).slice(0, 100).map((record) => ({
    id: stringField(record, "id"),
    type: stringField(record, "type"),
    name: stringField(record, "name"),
    proxied: booleanField(record, "proxied"),
    ttl: numberField(record, "ttl"),
    modified_on: stringField(record, "modified_on"),
  }));
}

function summarizeStripeList(response: UnknownRecord, fields: string[]) {
  if (response.skipped) return response;
  if (!response.ok || !isRecord(response.data)) return response;
  const data = response.data.data;
  const items = Array.isArray(data) ? data : [];
  return items.filter(isRecord).slice(0, 50).map((item) => {
    const out: UnknownRecord = {};
    for (const field of fields) out[field] = item[field];
    return sanitizeForReport(out);
  });
}

function skipped(reason: string) {
  return { skipped: true, reason };
}

function sanitizeForReport(value: unknown, key = ""): JsonValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return isSecretishKey(key) ? "[redacted]" : value;
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map((item) => sanitizeForReport(item, key));
  if (!isRecord(value)) return String(value);

  const out: Record<string, JsonValue> = {};
  for (const [childKey, childValue] of Object.entries(value)) {
    out[childKey] = sanitizeForReport(childValue, childKey);
  }
  return out;
}

function isSecretishKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SECRETISH_KEYS.some((needle) => lower === needle || lower.includes(needle));
}

function base64UrlJson(value: unknown): string {
  return base64UrlBytes(new TextEncoder().encode(JSON.stringify(value)));
}

function base64UrlBytes(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64.replace(/\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function base64ToUtf8(base64: string): string {
  return new TextDecoder().decode(base64ToBytes(base64));
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(value: unknown, key: string): string | undefined {
  return isRecord(value) && typeof value[key] === "string" ? value[key] : undefined;
}

function numberField(value: unknown, key: string): number | undefined {
  return isRecord(value) && typeof value[key] === "number" ? value[key] : undefined;
}

function booleanField(value: unknown, key: string): boolean | undefined {
  return isRecord(value) && typeof value[key] === "boolean" ? value[key] : undefined;
}

function nestedString(value: unknown, path: string[]): string | undefined {
  let current = value;
  for (const segment of path) {
    if (!isRecord(current)) return undefined;
    current = current[segment];
  }
  return typeof current === "string" ? current : undefined;
}

function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const strings = value.filter((item): item is string => typeof item === "string");
  return strings.length > 0 ? strings : undefined;
}
