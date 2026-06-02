import { NextRequest, NextResponse } from "next/server"

const PUBLIC_HOSTS = new Set([
  "defrag.app",
  "www.defrag.app",
  "sovereign.defrag.app",
])

const APP_HOSTS = new Set(["app.defrag.app"])

const PUBLIC_FILE = /\.(.*)$/

const OWNER_EMAIL = "chadowen93@gmail.com"

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
  // All marketing sub-pages are public
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

  // Owner bypass: skip Stripe gate entirely for owner email
  // The owner email is embedded in the JWT payload (sub claim is user id,
  // but we store email in a custom claim or check via API — here we rely
  // on the AuthGuard client-side check for tier, and use a server-side
  // header set by the auth API route for the owner flag)
  const isOwner =
    req.headers.get("x-sovereign-owner") === "true" ||
    req.cookies.get("sovereign-owner")?.value === "true"

  // Premium gate: redirect non-owners without active subscription
  if (
    pathname.startsWith("/premium") &&
    !isOwner
  ) {
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