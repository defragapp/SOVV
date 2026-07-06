// lib/chat.ts
// Client for chatthread Worker — https://chatthread.sovereign-os-api.workers.dev

const CHAT_API = "https://chatthread.sovereign-os-api.workers.dev"

export interface ChatResponse {
  reply: string
  session_id: string
}

export interface BuildJob {
  job_id: string
  status: "pending" | "running" | "success" | "failed"
}

export interface BuildStatus {
  id: string
  project_id: string
  status: "pending" | "running" | "success" | "failed"
  commit_sha: string | null
  log: string | null
  created_at: number
  updated_at: number
}

/**
 * Send a chat message to the chatthread Worker.
 * AutoRAG automatically injects relevant SOVV codebase context into every request.
 * Conversation history is persisted in D1 and replayed on subsequent calls with the same session_id.
 */
export async function sendChat(
  message: string,
  sessionId?: string
): Promise<ChatResponse> {
  const res = await fetch(`${CHAT_API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      message,
      session_id: sessionId ?? crypto.randomUUID(),
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any
    throw new Error(err.error ?? `Chat failed: ${res.status}`)
  }

  return res.json()
}

/**
 * Enqueue a build/deploy job.
 * The chatthread Worker processes it via the build-jobs Queue and updates D1.
 */
export async function enqueueBuild(
  projectId: string,
  commitSha?: string
): Promise<BuildJob> {
  const res = await fetch(`${CHAT_API}/build`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ project_id: projectId, commit_sha: commitSha }),
  })
  return res.json()
}

/**
 * Poll the status of a build job by ID.
 */
export async function getBuildStatus(jobId: string): Promise<BuildStatus> {
  const res = await fetch(`${CHAT_API}/build/${jobId}`, {
    credentials: "include",
  })
  return res.json()
}

/**
 * Health check — returns true if chatthread is reachable.
 */
export async function pingChatthread(): Promise<boolean> {
  try {
    const res = await fetch(`${CHAT_API}/health`)
    const data = await res.json() as any
    return data?.ok === true
  } catch {
    return false
  }
}
