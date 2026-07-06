import { NextRequest, NextResponse } from "next/server"

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.defrag.app"

export async function GET(req: NextRequest) {
  const res = await fetch(`${API}/api/admin/stats`, {
    headers: { cookie: req.headers.get("cookie") ?? "" },
  })
  const data = await res.text()
  return new NextResponse(data, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  })
}
