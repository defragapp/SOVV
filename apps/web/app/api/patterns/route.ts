import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app";
  const headers = new Headers();
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const r = await fetch(`${apiBase}/api/patterns`, {
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

export async function DELETE(req: Request) {
  const apiBase = process.env.API_BASE || "https://api.defrag.app";
  const headers = new Headers();
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const r = await fetch(`${apiBase}/api/patterns`, {
    method: "DELETE",
    headers,
  });

  const data = await r.text();
  return new NextResponse(data, {
    status: r.status,
    headers: { "content-type": "application/json" },
  });
}
