import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  const url = new URL(req.url)
  const r = await fetch(`${apiBase}/api/library${url.search}`, { method: "GET", headers })
  const data = await r.text()
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
}

export async function POST(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  headers.set("content-type", "application/json")
  const body = await req.text()
  const r = await fetch(`${apiBase}/api/library`, { method: "POST", headers, body })
  const data = await r.text()
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
}
