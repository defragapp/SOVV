import { NextRequest, NextResponse } from "next/server"

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.defrag.app"

export async function GET(req: NextRequest) {
  const res = await fetch(`${API}/api/commerce/baseline-guide/download`, {
    headers: { cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  })

  return new NextResponse(res.body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/octet-stream",
      "content-disposition": res.headers.get("content-disposition") ?? 'attachment; filename="sovereign-baseline-guide.html"',
      "cache-control": "private, no-store",
    },
  })
}
