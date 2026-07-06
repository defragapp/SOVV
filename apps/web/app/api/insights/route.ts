import { NextResponse } from "next/server"

export const runtime = "edge"

/**
 * GET /api/insights
 *
 * Cross-session pattern aggregation — what's recurring, shifting, and resolved.
 *
 * Query params:
 *   space     — "defrag" | "covenant" | "alignment" | "all" (default: "all")
 *   days      — lookback window in days (default: 30, max: 365)
 *   limit     — max patterns to return (default: 10)
 */
export async function GET(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)

  const url = new URL(req.url)
  const r = await fetch(`${apiBase}/api/insights${url.search}`, { method: "GET", headers })
  const data = await r.text()
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
}