import { NextResponse } from "next/server"

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  const r = await fetch(`${apiBase}/api/library/${id}`, { method: "GET", headers })
  const data = await r.text()
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  const r = await fetch(`${apiBase}/api/library/${id}`, { method: "DELETE", headers })
  const data = await r.text()
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
}
