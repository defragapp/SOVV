import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = request.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)

  const upstream = await fetch(`${apiBase}/api/auth/subscription`, {
    method: "GET",
    headers,
    cache: "no-store",
  })

  const body = await upstream.text()
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") || "application/json",
      "cache-control": "no-store, no-cache, must-revalidate",
    },
  })
}
