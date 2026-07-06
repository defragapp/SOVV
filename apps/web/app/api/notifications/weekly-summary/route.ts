import { NextResponse } from "next/server"

export const runtime = "edge"

/**
 * POST /api/notifications/weekly-summary
 *
 * Trigger weekly pattern summary email for a user (or all eligible users).
 * Called by a Cloudflare Cron Trigger or admin action.
 *
 * Body (admin trigger):
 * {
 *   userId?: string,   // specific user, or omit for all eligible
 *   dryRun?: boolean,  // preview without sending
 * }
 *
 * The worker generates a summary of:
 * - Patterns that appeared this week
 * - Most active space (Defrag/Covenant/Alignment)
 * - Streak status
 * - "Session of the week" — the session with the most insight
 */
export async function POST(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  headers.set("content-type", "application/json")
  const body = await req.text()

  const r = await fetch(`${apiBase}/api/notifications/weekly-summary`, {
    method: "POST",
    headers,
    body,
  })
  const data = await r.text()
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
}

/**
 * GET /api/notifications/weekly-summary
 * Preview the weekly summary for the current user (without sending).
 */
export async function GET(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)

  const r = await fetch(`${apiBase}/api/notifications/weekly-summary`, { method: "GET", headers })
  const data = await r.text()
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
}