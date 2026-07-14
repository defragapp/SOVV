import { NextRequest, NextResponse } from "next/server"

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.defrag.app"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const res = await fetch(`${API}/api/commerce/support/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    cache: "no-store",
  })

  return new NextResponse(await res.text(), {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  })
}
