import { NextResponse } from "next/server"

export const runtime = "edge"

/**
 * POST /api/defrag/message
 * Defrag a text message — paste any message, get a pattern read.
 *
 * Body: { message: string, context?: string }
 */
export async function POST(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  headers.set("content-type", "application/json")
  const body = await req.text()

  const r = await fetch(`${apiBase}/api/defrag/message`, { method: "POST", headers, body })
  const data = await r.text()
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
}