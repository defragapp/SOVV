import { NextResponse } from "next/server"

const API_BASE = process.env.API_BASE || "https://api.defrag.app"

export async function GET(req: Request) {
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)

  const r = await fetch(`${API_BASE}/api/admin/me`, {
    method: "GET",
    headers,
  })
  const data = await r.text()
  return new NextResponse(data, {
    status: r.status,
    headers: { "content-type": "application/json" },
  })
}
