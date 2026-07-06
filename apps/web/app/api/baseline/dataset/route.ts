import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app"
  const headers = new Headers()
  const cookie = req.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  const r = await fetch(`${apiBase}/api/baseline/dataset`, { method: "GET", headers })
  const data = await r.text()
  const res = new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } })
  const sc = r.headers.get("set-cookie"); if (sc) res.headers.set("set-cookie", sc)
  return res
}
