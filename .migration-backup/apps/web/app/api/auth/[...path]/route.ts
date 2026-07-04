import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE || "https://api.defrag.app";

async function proxyAuth(req: Request, pathParts: string[] = []) {
  const suffix = pathParts.join("/");
  const url = `${API_BASE}/api/auth/${suffix}`;

  const headers = new Headers();
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
    if (body) {
      headers.set("content-type", req.headers.get("content-type") || "application/json");
    }
  }

  const r = await fetch(url, {
    method: req.method,
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

export async function GET(req: Request, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return proxyAuth(req, params.path);
}

export async function POST(req: Request, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return proxyAuth(req, params.path);
}

export async function PUT(req: Request, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return proxyAuth(req, params.path);
}

export async function PATCH(req: Request, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return proxyAuth(req, params.path);
}

export async function DELETE(req: Request, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return proxyAuth(req, params.path);
}

export async function OPTIONS(req: Request, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return proxyAuth(req, params.path);
}
