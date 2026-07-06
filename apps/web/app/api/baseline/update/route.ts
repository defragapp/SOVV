import { NextResponse } from "next/server"

export const runtime = "edge"

/**
 * POST /api/baseline/update
 * Re-run Baseline Design after major life changes. Preserves history snapshot.
 */
export async function POST(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  headers.set("content-type", "application/json")
  const body = await req.text()

  const r = await fetch(`${apiBase}/api/baseline/update`, { method: "POST", headers, body })
  const data = await r.text()
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
}
