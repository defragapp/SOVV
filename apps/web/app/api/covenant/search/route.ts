import { NextResponse } from "next/server"

/**
 * GET /api/covenant/search
 * Search scripture by theme (e.g. "forgiveness", "boundaries", "grief").
 *
 * Query params:
 *   theme   — the theme to search (required)
 *   limit   — max results (default: 5)
 *   version — Bible version (default: "ESV")
 */
export async function GET(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)

  const url = new URL(req.url)
  const r = await fetch(`${apiBase}/api/covenant/search${url.search}`, { method: "GET", headers })
  const data = await r.text()
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
}