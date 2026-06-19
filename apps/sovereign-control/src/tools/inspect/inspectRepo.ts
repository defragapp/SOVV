import type { Env } from "../../types.js"

export async function inspectRepo(
  env: Env,
  params: { path?: string; ref?: string }
): Promise<unknown> {
  const token = env.GITHUB_READ_TOKEN
  if (!token) {
    return { status: "not_enabled", message: "GITHUB_READ_TOKEN not configured" }
  }

  const path = params.path || ""
  const ref = params.ref || "main"
  const url = `https://api.github.com/repos/defragapp/SOVV/contents/${path}?ref=${ref}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "sovereign-control/1.0",
      Accept: "application/vnd.github.v3+json",
    },
  })

  if (!res.ok) {
    return { status: "error", message: `GitHub API error: ${res.status}` }
  }

  const data = await res.json()
  // Strip content blobs for directory listings
  if (Array.isArray(data)) {
    return data.map((item: Record<string, unknown>) => ({
      name: item.name,
      type: item.type,
      path: item.path,
      size: item.size,
    }))
  }

  // For files, decode content
  if (data && typeof data === "object" && "content" in data) {
    const content = atob((data as Record<string, string>).content.replace(/
/g, ""))
    return {
      path: (data as Record<string, string>).path,
      content: content.slice(0, 50000), // cap at 50KB
      sha: (data as Record<string, string>).sha,
      size: (data as Record<string, number>).size,
    }
  }

  return data
}
