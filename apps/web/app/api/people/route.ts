import { NextResponse } from "next/server"
const BASE = () => process.env.API_BASE || "https://api.defrag.app"
function h(req: Request) { const h = new Headers(); const c = req.headers.get("cookie"); if (c) h.set("cookie", c); return h }
export async function GET(req: Request) {
  const r = await fetch(`${BASE()}/api/people`, { headers: h(req) })
  return new NextResponse(await r.text(), { status: r.status, headers: { "content-type": "application/json" } })
}
export async function POST(req: Request) {
  const hd = h(req); hd.set("content-type", "application/json")
  const r = await fetch(`${BASE()}/api/people`, { method: "POST", headers: hd, body: await req.text() })
  return new NextResponse(await r.text(), { status: r.status, headers: { "content-type": "application/json" } })
}
