import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
  const headers = new Headers();
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const r = await fetch(`${apiBase}/api/billing/checkout`, {
    method: "POST",
    headers
  });
  const data = await r.text();
  const response = new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } });

  const setCookie = r.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);
  return response;
}
