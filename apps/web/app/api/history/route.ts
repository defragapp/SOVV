import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app";
  const headers = new Headers();
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const r = await fetch(`${apiBase}/api/history`, {
    method: "GET",
    headers,
  });

  const data = await r.text();
  const response = new NextResponse(data, {
    status: r.status,
    headers: { "content-type": "application/json" },
  });
  const setCookie = r.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);
  return response;
}

export async function POST(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app";
  const headers = new Headers();
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  headers.set("content-type", "application/json");

  const body = await req.text();
  const r = await fetch(`${apiBase}/api/history`, {
    method: "POST",
    headers,
    body,
  });

  const data = await r.text();
  const response = new NextResponse(data, {
    status: r.status,
    headers: { "content-type": "application/json" },
  });
  const setCookie = r.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);
  return response;
}
