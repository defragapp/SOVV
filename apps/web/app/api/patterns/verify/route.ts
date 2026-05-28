import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://api.defrag.app";
  const headers = new Headers();
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const body = await req.text();
  headers.set("content-type", "application/json");

  const r = await fetch(`${apiBase}/api/patterns/verify`, {
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
