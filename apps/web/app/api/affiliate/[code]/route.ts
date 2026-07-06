import { NextResponse } from "next/server"

export const runtime = "edge"

/**
 * GET /api/affiliate/[code] — validate an affiliate code
 */
export async function GET(req: Request, { params }: { params: { code: string } }) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)

  const r = await fetch(`${apiBase}/api/affiliate/${encodeURIComponent(params.code)}`, { method: "GET", headers })
  const data = await r.text()
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
}
