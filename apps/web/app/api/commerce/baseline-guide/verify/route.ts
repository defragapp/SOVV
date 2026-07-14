import { NextRequest, NextResponse } from "next/server"

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.defrag.app"

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id") ?? ""
  const res = await fetch(
    `${API}/api/commerce/baseline-guide/verify?session_id=${encodeURIComponent(sessionId)}`,
    {
      headers: { cookie: req.headers.get("cookie") ?? "" },
      cache: "no-store",
    },
  )

  return new NextResponse(await res.text(), {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  })
}
