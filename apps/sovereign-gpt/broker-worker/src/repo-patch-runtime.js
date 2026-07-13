const REPO_OWNER = "defragapp"
const REPO_NAME = "SOVV"
const BLOCKED_PATH_PATTERNS = [/\.env/i, /secret/i, /\.pem$/i, /\.key$/i, /\.pfx$/i, /private/i, /credentials/i, /id_rsa/i, /\.dev\.vars/i]

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
})

const blocked = (reason) => json({ ok: false, blocked: true, reason }, 403)
const isEnabled = (env, flag) => String(env[flag] || "false").toLowerCase() === "true"
const encodePath = (path) => encodeURIComponent(path).replace(/%2F/g, "/")
const isPathBlocked = (path) => !path || path.includes("..") || BLOCKED_PATH_PATTERNS.some((pattern) => pattern.test(path))

async function ghFetch(path, env, options = {}) {
  return fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "sovereign-broker/4.0",
      ...(options.headers || {}),
    },
  })
}

async function parseResponse(response) {
  if (response.status === 204) return null
  const type = response.headers.get("content-type") || ""
  return type.includes("json") ? response.json().catch(() => null) : response.text()
}

export function parseUnifiedPatch(patch) {
  const lines = String(patch || "").replace(/\r\n/g, "\n").split("\n")
  const files = []
  let current = null
  let hunk = null

  for (const line of lines) {
    if (line.startsWith("--- ")) continue
    if (line.startsWith("+++ ")) {
      const path = line.slice(4).trim().replace(/^b\//, "")
      if (!path || path === "/dev/null") throw new Error("Patch must target an existing repository file")
      current = { path, hunks: [] }
      files.push(current)
      hunk = null
      continue
    }
    if (line.startsWith("@@")) {
      if (!current) throw new Error("Patch hunk appears before a file header")
      const match = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/)
      if (!match) throw new Error(`Invalid hunk header: ${line}`)
      hunk = {
        oldStart: Number(match[1]),
        oldCount: Number(match[2] || 1),
        newStart: Number(match[3]),
        newCount: Number(match[4] || 1),
        lines: [],
      }
      current.hunks.push(hunk)
      continue
    }
    if (hunk && (line.startsWith(" ") || line.startsWith("+") || line.startsWith("-") || line === "\\ No newline at end of file")) {
      if (line !== "\\ No newline at end of file") hunk.lines.push(line)
    }
  }

  if (!files.length) throw new Error("Patch does not contain any files")
  return files
}

export function applyUnifiedHunks(original, filePatch) {
  const source = String(original).replace(/\r\n/g, "\n").split("\n")
  const output = []
  let sourceIndex = 0

  for (const hunk of filePatch.hunks) {
    const targetIndex = hunk.oldStart - 1
    if (targetIndex < sourceIndex) throw new Error(`Overlapping hunks for ${filePatch.path}`)
    output.push(...source.slice(sourceIndex, targetIndex))
    let cursor = targetIndex

    for (const line of hunk.lines) {
      const marker = line[0]
      const text = line.slice(1)
      if (marker === " ") {
        if (source[cursor] !== text) throw new Error(`Context mismatch in ${filePatch.path} at line ${cursor + 1}`)
        output.push(text)
        cursor += 1
      } else if (marker === "-") {
        if (source[cursor] !== text) throw new Error(`Removal mismatch in ${filePatch.path} at line ${cursor + 1}`)
        cursor += 1
      } else if (marker === "+") {
        output.push(text)
      }
    }
    sourceIndex = cursor
  }

  output.push(...source.slice(sourceIndex))
  return output.join("\n")
}

export async function handleRepoDiff(request, env) {
  const match = new URL(request.url).pathname.match(/^\/repo\/diff\/([A-Za-z0-9_-]+)$/)
  if (!match) return json({ ok: false, error: "Invalid diff ID" }, 400)
  if (!env.LOGS) return json({ ok: false, error: "Diff storage is not configured" }, 503)
  const object = await env.LOGS.get(`repo-diffs/${match[1]}.json`)
  if (!object) return json({ ok: false, error: "Diff not found", id: match[1] }, 404)
  return json({ ok: true, ...JSON.parse(await object.text()) })
}

export async function handleRepoApplyPatch(request, env) {
  if (!isEnabled(env, "AGENT_ENABLED")) return blocked("AGENT_ENABLED is false.")
  const body = await request.json().catch(() => ({}))
  const dryRun = body.dry_run !== false
  if (!dryRun && !isEnabled(env, "AGENT_WRITE_ENABLED")) return blocked("AGENT_WRITE_ENABLED is false.")
  if (!dryRun && body.confirm !== true) return blocked("confirm: true is required for committed patches.")
  if (typeof body.patch !== "string" || !body.patch.trim()) return json({ ok: false, error: "Missing patch" }, 400)

  let parsed
  try {
    parsed = parseUnifiedPatch(body.patch)
  } catch (error) {
    return json({ ok: false, error: error.message }, 400)
  }

  const updates = []
  for (const filePatch of parsed) {
    if (isPathBlocked(filePatch.path)) return blocked(`Path '${filePatch.path}' is blocked.`)
    const fileResponse = await ghFetch(`/contents/${encodePath(filePatch.path)}?ref=main`, env)
    const fileData = await parseResponse(fileResponse)
    if (!fileResponse.ok || !fileData?.content || fileData.type !== "file") {
      return json({ ok: false, error: `Could not read patch target: ${filePatch.path}`, github: fileData }, fileResponse.status || 400)
    }
    const original = atob(fileData.content.replace(/\n/g, ""))
    try {
      updates.push({
        path: filePatch.path,
        sha: fileData.sha,
        content: applyUnifiedHunks(original, filePatch),
      })
    } catch (error) {
      return json({ ok: false, error: error.message, path: filePatch.path }, 400)
    }
  }

  const diffId = `diff_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const stored = { id: diffId, created_at: new Date().toISOString(), paths: updates.map((item) => item.path), diff: body.patch }
  if (env.LOGS) await env.LOGS.put(`repo-diffs/${diffId}.json`, JSON.stringify(stored), { httpMetadata: { contentType: "application/json" } })
  if (dryRun) return json({ ok: true, dry_run: true, diff_id: diffId, paths: stored.paths, diff: body.patch })

  const commits = []
  for (const update of updates) {
    const response = await ghFetch(`/contents/${encodePath(update.path)}`, env, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `${body.message || "Apply repository patch"} [sovereign-broker]`,
        content: btoa(unescape(encodeURIComponent(update.content))),
        sha: update.sha,
        branch: "main",
      }),
    })
    const data = await parseResponse(response)
    if (!response.ok) return json({ ok: false, committed: false, error: `Commit failed for ${update.path}`, github: data, commits }, response.status)
    commits.push({ path: update.path, commit_sha: data.commit?.sha, url: data.commit?.html_url })
  }

  return json({ ok: true, dry_run: false, committed: true, diff_id: diffId, paths: stored.paths, commits })
}
