import { NextResponse } from "next/server"
const API = process.env.API_BASE || "https://api.defrag.app"
function proxy(req: Request, path: string, method: string, body?: string) {
  const h = new Headers(); const c = req.headers.get("cookie"); if (c) h.set("cookie", c)
  if (body) h.set("content-type", "application/json")
  return fetch(`${API}${path}`, { method, headers: h, body }).then(async r => {
    const d = await r.text(); const res = new NextResponse(d, { status: r.status, headers: { "content-type": "application/json" } })
    const sc = r.headers.get("set-cookie"); if (sc) res.headers.set("set-cookie", sc); return res
  })
}
export async function GET(req: Request) { return proxy(req, "/api/invite", "GET") }
export async function POST(req: Request) { return proxy(req, "/api/invite", "POST", await req.text()) }
