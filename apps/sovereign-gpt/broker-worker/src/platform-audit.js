const REPO = "defragapp/SOVV"
const CF_ACCOUNT = "8b1954d216d65077c6480d62583fe2c2"

async function readJson(response) {
  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("json")) return null
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options)
  const data = await readJson(response)
  if (!response.ok) {
    const message = data?.message || data?.errors?.[0]?.message || response.statusText || "Request failed"
    throw new Error(`${response.status}: ${message}`)
  }
  return data
}

function githubHeaders(env) {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "sovereign-broker/3.1",
  }
}

function cloudflareHeaders(env) {
  return {
    Authorization: `Bearer ${env.CF_API_TOKEN}`,
    "Content-Type": "application/json",
  }
}

function stripeHeaders(env) {
  return {
    Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
    "Content-Type": "application/x-www-form-urlencoded",
  }
}

async function githubSnapshot(env) {
  const headers = githubHeaders(env)
  const [ref, commits, pulls] = await Promise.all([
    requestJson(`https://api.github.com/repos/${REPO}/git/ref/heads/main`, { headers }),
    requestJson(`https://api.github.com/repos/${REPO}/commits?sha=main&per_page=8`, { headers }),
    requestJson(`https://api.github.com/repos/${REPO}/pulls?state=open&per_page=25`, { headers }),
  ])

  return {
    connected: true,
    branch: "main",
    head_sha: ref?.object?.sha || null,
    recent_commits: Array.isArray(commits)
      ? commits.map((commit) => ({
          sha: commit.sha,
          message: commit.commit?.message?.split("\n")[0] || "",
          date: commit.commit?.committer?.date || commit.commit?.author?.date || null,
          url: commit.html_url || null,
        }))
      : [],
    open_pull_requests: Array.isArray(pulls)
      ? pulls.map((pull) => ({
          number: pull.number,
          title: pull.title,
          branch: pull.head?.ref || null,
          url: pull.html_url || null,
          draft: Boolean(pull.draft),
          updated_at: pull.updated_at || null,
        }))
      : [],
  }
}

async function cloudflareSnapshot(env) {
  const headers = cloudflareHeaders(env)
  const [workersResult, pagesResult] = await Promise.allSettled([
    requestJson(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/workers/scripts`, { headers }),
    requestJson(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/pages/projects/sovv-web/deployments?per_page=5`, { headers }),
  ])

  const workers = workersResult.status === "fulfilled"
    ? {
        ok: true,
        data: Array.isArray(workersResult.value?.result)
          ? workersResult.value.result.map((worker) => ({
              name: worker.id,
              modified_on: worker.modified_on || null,
              etag: worker.etag || null,
            }))
          : [],
      }
    : { ok: false, error: workersResult.reason?.message || "Workers request failed" }

  const pages = pagesResult.status === "fulfilled"
    ? {
        ok: true,
        data: Array.isArray(pagesResult.value?.result)
          ? pagesResult.value.result.map((deployment) => ({
              id: deployment.id,
              environment: deployment.environment,
              url: deployment.url,
              created_on: deployment.created_on,
              status: deployment.latest_stage?.status || deployment.latest_stage?.name || null,
            }))
          : [],
      }
    : { ok: false, error: pagesResult.reason?.message || "Pages request failed" }

  if (!workers.ok && !pages.ok) {
    throw new Error(`Workers: ${workers.error}; Pages: ${pages.error}`)
  }

  return {
    connected: true,
    workers,
    pages,
  }
}

async function stripeSnapshot(env) {
  const headers = stripeHeaders(env)
  const [account, subscriptions] = await Promise.all([
    requestJson("https://api.stripe.com/v1/account", { headers }),
    requestJson("https://api.stripe.com/v1/subscriptions?status=active&limit=100", { headers }),
  ])

  return {
    connected: true,
    account_id: account?.id || null,
    charges_enabled: Boolean(account?.charges_enabled),
    payouts_enabled: Boolean(account?.payouts_enabled),
    active_subscriptions: Array.isArray(subscriptions?.data) ? subscriptions.data.length : 0,
  }
}

function settledResult(result) {
  if (result.status === "fulfilled") return { ok: true, data: result.value }
  return { ok: false, error: result.reason?.message || "Unknown error" }
}

function workerList(snapshot) {
  return snapshot.cloudflare.ok && snapshot.cloudflare.data.workers?.ok
    ? snapshot.cloudflare.data.workers.data
    : []
}

function buildRecommendations(snapshot) {
  const recommendations = []

  if (!snapshot.github.ok) {
    recommendations.push({ priority: 1, area: "github", action: "Restore broker GitHub authorization before repository mutations." })
  }
  if (!snapshot.cloudflare.ok) {
    recommendations.push({ priority: 1, area: "cloudflare", action: "Restore Cloudflare API authorization and verify Worker/domain routing." })
  } else if (!snapshot.cloudflare.data.workers?.ok) {
    recommendations.push({ priority: 1, area: "cloudflare-workers", action: "Restore Cloudflare Workers read access before deployment decisions." })
  }
  if (snapshot.github.ok && snapshot.github.data.open_pull_requests.length > 0) {
    recommendations.push({ priority: 2, area: "repository", action: "Review and resolve open pull requests before starting overlapping platform work." })
  }

  const workers = workerList(snapshot)
  if (snapshot.cloudflare.ok && snapshot.cloudflare.data.workers?.ok && !workers.some((worker) => worker.name === "sovereign-broker")) {
    recommendations.push({ priority: 1, area: "broker", action: "Restore the sovereign-broker Worker deployment." })
  }
  if (snapshot.cloudflare.ok && snapshot.cloudflare.data.workers?.ok && !workers.some((worker) => worker.name === "sovv-web")) {
    recommendations.push({ priority: 1, area: "web", action: "Restore the sovv-web Worker deployment." })
  }
  if (snapshot.cloudflare.ok && !snapshot.cloudflare.data.pages?.ok) {
    recommendations.push({ priority: 3, area: "cloudflare-pages", action: "Pages evidence is unavailable; do not treat this as a Worker outage." })
  }
  if (!snapshot.stripe.ok) {
    recommendations.push({ priority: 2, area: "stripe", action: "Restore read-only Stripe connectivity before making monetization claims." })
  }
  if (recommendations.length === 0) {
    recommendations.push({ priority: 3, area: "platform", action: "Run product-flow and production smoke validation, then choose the highest-impact verified defect." })
  }

  return recommendations.sort((a, b) => a.priority - b.priority)
}

export async function buildPlatformAudit(env) {
  const startedAt = new Date().toISOString()
  const [github, cloudflare, stripe] = await Promise.allSettled([
    githubSnapshot(env),
    cloudflareSnapshot(env),
    stripeSnapshot(env),
  ])

  const snapshot = {
    github: settledResult(github),
    cloudflare: settledResult(cloudflare),
    stripe: settledResult(stripe),
  }

  const systems = Object.values(snapshot)
  const connected = systems.filter((system) => system.ok).length

  return {
    ok: connected === systems.length,
    status: connected === systems.length ? "healthy" : connected > 0 ? "degraded" : "blocked",
    platform: "Sovereign.OS",
    broker_version: "3.1",
    generated_at: new Date().toISOString(),
    started_at: startedAt,
    project_state: snapshot,
    safety: {
      agent_enabled: String(env.AGENT_ENABLED || "false").toLowerCase() === "true",
      write_enabled: String(env.AGENT_WRITE_ENABLED || "false").toLowerCase() === "true",
      deploy_enabled: String(env.AGENT_DEPLOY_ENABLED || "false").toLowerCase() === "true",
      pr_enabled: String(env.AGENT_PR_ENABLED || "false").toLowerCase() === "true",
      destructive_enabled: String(env.AGENT_DESTRUCTIVE_ACTIONS_ENABLED || "false").toLowerCase() === "true",
    },
    recommendations: buildRecommendations(snapshot),
  }
}

export const __test = { buildRecommendations, settledResult, workerList }
