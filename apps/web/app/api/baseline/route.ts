import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
  const headers = new Headers();
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const r = await fetch(`${apiBase}/api/baseline`, {
    method: "GET",
    headers
  });

  const data = await r.text();
  const response = new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } });
  const setCookie = r.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);
  return response;
}

export async function POST(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
  const body = await req.text();
  const headers = new Headers({ "content-type": "application/json" });
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const r = await fetch(`${apiBase}/api/baseline`, {
    method: "POST",
    headers,
    body
  });

  const data = await r.text();
  const response = new NextResponse(data, { status: r.status, headers: { "content-type": "application/json" } });
  const setCookie = r.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);
  return response;
}
