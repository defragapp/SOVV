import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  headers.set("content-type", "application/json")

  const body = await req.text()
  const r = await fetch(`${apiBase}/api/audio`, { method: "POST", headers, body })

  // Audio returns binary data
  const contentType = r.headers.get("content-type") || "audio/mpeg"
  const audioData = await r.arrayBuffer()
  return new NextResponse(audioData, {
    status: r.status,
    headers: { "content-type": contentType, "cache-control": "no-store" },
  })
}
