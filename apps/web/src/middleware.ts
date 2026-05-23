import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";

const TEAM_DOMAIN = "https://silent-term-5015.cloudflareaccess.com";
const JWKS = createRemoteJWKSet(new URL(`${TEAM_DOMAIN}/cdn-cgi/access/certs`));

const AUD_TAGS: Record<string, string> = {
  // "defrag.app" is now the public landing page. The free workspace is on "app.defrag.app".
  "app.defrag.app": "1cd51813d28c0d4ae02c96dff6826212a5274755875dbff0275dd3c7795b77c7",
  "premium.defrag.app": "ed2719659d64535068361b7b0dc3942ab8f99b78a24d54de1f936dce37c8364d",
};

export async function middleware(request: NextRequest) {
  const jwtHeader = request.headers.get("cf-access-jwt-assertion");
  const host = request.headers.get("host")?.replace(/:\d+$/, "");

  if (!jwtHeader) {
    return NextResponse.next();
  }

  try {
    const aud = host ? AUD_TAGS[host] : undefined;
    const { payload } = await jwtVerify(jwtHeader, JWKS, {
      issuer: TEAM_DOMAIN,
      ...(aud && { audience: aud }),
    });

    const userEmail = payload.email as string;
    const jwtAud = payload.aud as string | string[];
    const userTier = jwtAud === AUD_TAGS["premium.defrag.app"] ? "pro" : "free";

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("X-User-Email", userEmail);
    requestHeaders.set("X-User-Tier", userTier);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    console.error("JWT verification failed:", error);
    return new Response("Unauthorized", { status: 401 });
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};