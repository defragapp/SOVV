import { NextResponse } from "next/server"

/**
 * GET /api/alignment/calendar
 * Fetch upcoming calendar events to suggest Alignment timing.
 * Requires Google Calendar OAuth token stored in user's KV.
 *
 * Query params:
 *   days — lookahead window in days (default: 7)
 */
export async function GET(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)

  const url = new URL(req.url)
  const r = await fetch(`${apiBase}/api/alignment/calendar${url.search}`, { method: "GET", headers })
  const data = await r.text()
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
}

/**
 * POST /api/alignment/calendar/connect
 * Exchange Google OAuth code for tokens and store in user's KV.
 */
export async function POST(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  headers.set("content-type", "application/json")
  const body = await req.text()

  const r = await fetch(`${apiBase}/api/alignment/calendar/connect`, { method: "POST", headers, body })
  const data = await r.text()
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
}