import { NextResponse } from "next/server"

/**
 * GET /api/admin/cohorts
 * Segment users by signup date, tier, and usage. Admin only (enforced at worker).
 *
 * Query params: from, to, tier, min_sessions, page, per_page
 */
export async function GET(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)

  const url = new URL(req.url)
  const r = await fetch(`${apiBase}/api/admin/cohorts${url.search}`, { method: "GET", headers })
  const data = await r.text()
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
}
