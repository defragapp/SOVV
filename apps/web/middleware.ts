import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
import { NextRequest, NextResponse } from "next/server"

const PUBLIC_HOSTS = new Set([
  "defrag.app",
  "www.defrag.app",import { NextRequest, NextResponse } from "next/server"

const PUBLIC_HOSTS = new Set([
  "defrag.app",
  "www.defrag.app",
  "sovereign.defrag.app",
])

const APP_HOSTS = new Set(["app.defrag.app"])

const PUBLIC_FILE = /\.(.*)$/

export function middleware(req: NextRequest) {
  const host = req.headers.get("host")?.toLowerCase() ?? ""
  const url = req.nextUrl.clone()
  const pathname = url.pathname

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  if (PUBLIC_HOSTS.has(host)) {
    if (pathname === "/") {
      url.pathname = "/landing"
      return NextResponse.rewrite(url)
    }

    if (pathname.startsWith("/settings")) {
      return NextResponse.redirect(new URL(`https://app.defrag.app${pathname}`))
    }
  }

  if (APP_HOSTS.has(host)) {
    if (pathname === "/") {
      url.pathname = "/app"
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
}
  "sovereign.defrag.app",
])

const APP_HOSTS = new Set(["app.defrag.app"])

const PUBLIC_FILE = /\.(.*)$/

export function middleware(req: NextRequest) {
  const host = req.headers.get("host")?.toLowerCase() ?? ""
  const url = req.nextUrl.clone()
  const pathname = url.pathname

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  if (PUBLIC_HOSTS.has(host)) {
    if (pathname === "/") {
      url.pathname = "/landing"
      return NextResponse.rewrite(url)
    }

    if (pathname.startsWith("/settings")) {
      return NextResponse.redirect(new URL(`https://app.defrag.app${pathname}`))
    }
  }

  if (APP_HOSTS.has(host)) {
    if (pathname === "/") {
      url.pathname = "/app"
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
}
