import { NextResponse } from "next/server"
export async function POST(req: Request) {
  const h = new Headers(); const c = req.headers.get("cookie"); if (c) h.set("cookie", c)
  h.set("content-type", req.headers.get("content-type") || "application/json")
  const r = await fetch(`${process.env.API_BASE || "https://api.defrag.app"}/api/covenant`, { method: "POST", headers: h, body: await req.text() })
  const res = new NextResponse(await r.text(), { status: r.status, headers: { "content-type": "application/json" } })
  const sc = r.headers.get("set-cookie"); if (sc) res.headers.set("set-cookie", sc); return res
}
