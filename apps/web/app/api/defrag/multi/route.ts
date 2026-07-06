import { NextResponse } from "next/server"

/**
 * POST /api/defrag/multi
 * Multi-person Defrag — compare patterns across 3+ people simultaneously.
 */
export async function POST(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  headers.set("content-type", "application/json")
  const body = await req.text()

  const r = await fetch(`${apiBase}/api/defrag/multi`, { method: "POST", headers, body })
  const data = await r.text()
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
}
