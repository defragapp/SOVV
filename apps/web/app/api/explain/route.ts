import { NextResponse } from "next/server";


export async function POST(req: Request) {
  const body = await req.text();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
  const headers = new Headers(req.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const r = await fetch(`${apiBase}/api/explain`, {
    method: "POST",
    headers,
    body
  });

  const data = await r.text();
  const response = new NextResponse(data, {
    status: r.status,
    headers: { "content-type": "application/json" }
  });

  const setCookie = r.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);
  return response;
}
