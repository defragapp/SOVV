import { NextResponse } from "next/server";


export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") || "self";
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
  const r = await fetch(`${apiBase}/api/chips?mode=${encodeURIComponent(mode)}`);
  const data = await r.text();
  return new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } });
}
