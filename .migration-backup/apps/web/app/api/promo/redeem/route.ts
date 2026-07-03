import { NextResponse } from "next/server"

const API_BASE = process.env.API_BASE || "https://api.defrag.app"

export async function POST(req: Request) {
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)

  const body = await req.text()
  if (body) {
    headers.set("content-type", req.headers.get("content-type") || "application/json")
  }

  const r = await fetch(`${API_BASE}/api/promo/redeem`, {
    method: "POST",
    headers,
    body,
  })

  const data = await r.text()
  return new NextResponse(data, {
    status: r.status,
    headers: { "content-type": "application/json" },
  })
}
