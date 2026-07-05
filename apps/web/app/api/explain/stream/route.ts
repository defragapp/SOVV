import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  headers.set("content-type", "application/json")
  headers.set("accept", "text/event-stream")

  const body = await req.text()

  const r = await fetch(`${apiBase}/api/explain/stream`, {
    method: "POST",
    headers,
    body,
  })

  // Pass through the SSE stream directly
  return new Response(r.body, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "text/event-stream",
      "cache-control": "no-cache",
      "x-accel-buffering": "no",
      ...(r.headers.get("set-cookie") ? { "set-cookie": r.headers.get("set-cookie")! } : {}),
    },
  })
}
