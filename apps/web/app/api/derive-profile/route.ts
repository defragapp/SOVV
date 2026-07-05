import { NextResponse } from "next/server"
export async function GET(req: Request) {
  const h = new Headers(); const c = req.headers.get("cookie"); if (c) h.set("cookie", c)
  const r = await fetch(`${process.env.API_BASE || "https://api.defrag.app"}/api/derive-profile`, { headers: h })
  return new NextResponse(await r.text(), { status: r.status, headers: { "content-type": "application/json" } })
}
