import { NextResponse } from "next/server"
export async function POST(req: Request, props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params
  const h = new Headers(); const c = req.headers.get("cookie"); if (c) h.set("cookie", c)
  h.set("content-type", "application/json")
  const r = await fetch(`${process.env.API_BASE || "https://api.defrag.app"}/api/invite/${token}/result`, { method: "POST", headers: h, body: await req.text() })
  return new NextResponse(await r.text(), { status: r.status, headers: { "content-type": "application/json" } })
}
