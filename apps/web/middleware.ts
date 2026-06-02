import { NextRequest, NextResponse } from "next/server"

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

  // Pass through static assets and API routes immediately
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.includes(".") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Public marketing hosts — serve root directly (full marketing site)
  if (PUBLIC_HOSTS.has(host)) {
    return NextResponse.next()
  }

  // App host routing
  if (APP_HOSTS.has(host)) {
    if (pathname === "/") {
      url.pathname = "/app"
      return NextResponse.rewrite(url)
    }
  }

  // Auth check for protected routes
  if (pathname.startsWith("/workspace") || pathname.startsWith("/app")) {
    const sessionCookie =
      req.cookies.get("sb-access-token")?.value ||
      req.cookies.get("supabase-auth-token")?.value ||
      req.cookies.get("__session")?.value

    if (!sessionCookie) {
      url.pathname = "/app/login"
      return NextResponse.redirect(url)
    }
  }

  // Premium gate: redirect users without active subscription
  if (pathname.startsWith("/premium")) {
    const hasSub =
      req.cookies.get("sovereign-tier")?.value === "pro" ||
      req.cookies.get("sovereign-tier")?.value === "premium"

    if (!hasSub) {
      url.pathname = "/billing"
      return NextResponse.redirect(url)
    }
  }

  // Legacy settings redirect
  if (pathname.startsWith("/settings")) {
    return NextResponse.redirect(new URL(`https://app.defrag.app${pathname}`))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
}