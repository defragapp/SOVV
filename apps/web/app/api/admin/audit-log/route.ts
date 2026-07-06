import { NextRequest, NextResponse } from "next/server"

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.defrag.app"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limit = url.searchParams.get("limit") ?? "50"
  const res = await fetch(`${API}/api/admin/audit-log?limit=${limit}`, {
    headers: { cookie: req.headers.get("cookie") ?? "" },
  })
  const data = await res.text()
  return new NextResponse(data, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  })
}
