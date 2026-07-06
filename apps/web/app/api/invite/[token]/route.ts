import { NextResponse } from "next/server"
export async function GET(req: Request, props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params
  const h = new Headers(); const c = req.headers.get("cookie"); if (c) h.set("cookie", c)
  const r = await fetch(`${process.env.API_BASE || "https://api.defrag.app"}/api/invite/${token}`, { headers: h })
  return new NextResponse(await r.text(), { status: r.status, headers: { "content-type": "application/json" } })
}
export async function DELETE(req: Request, props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params
  const h = new Headers(); const c = req.headers.get("cookie"); if (c) h.set("cookie", c)
  const r = await fetch(`${process.env.API_BASE || "https://api.defrag.app"}/api/invite/${token}`, { method: "DELETE", headers: h })
  return new NextResponse(await r.text(), { status: r.status, headers: { "content-type": "application/json" } })
}
