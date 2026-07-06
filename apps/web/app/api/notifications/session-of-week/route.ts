import { NextResponse } from "next/server"

export const runtime = "edge"

/**
 * GET /api/notifications/session-of-week
 *
 * Returns the "session of the week" for the current user —
 * the session with the most significant pattern recognition from the past 7 days.
 * Used to re-engage dormant users with a meaningful prompt.
 *
 * Response:
 * {
 *   session: {
 *     id: string,
 *     space: "defrag" | "covenant" | "alignment",
 *     title: string,          // AI-generated title for the session
 *     keyInsight: string,     // the most significant insight from the session
 *     bestNextResponse: string,
 *     createdAt: string,
 *   } | null,
 *   prompt: string,           // re-engagement prompt text
 *   lastActiveAt: string | null,
 * }
 */
export async function GET(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)

  const r = await fetch(`${apiBase}/api/notifications/session-of-week`, { method: "GET", headers })
  const data = await r.text()
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
}