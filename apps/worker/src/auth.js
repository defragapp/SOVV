import { jwtVerify, createRemoteJWKSet } from "jose";
const TEAM_DOMAIN = "https://silent-term-5015.cloudflareaccess.com";
const JWKS = createRemoteJWKSet(new URL(`${TEAM_DOMAIN}/cdn-cgi/access/certs`));
const PREMIUM_AUD = "ed2719659d64535068361b7b0dc3942ab8f99b78a24d54de1f936dce37c8364d";
const FREE_AUD = "1cd51813d28c0d4ae02c96dff6826212a5274755875dbff0275dd3c7795b77c7";
export async function verifyAccessJWT(request) {
    const token = request.headers.get("cf-access-jwt-assertion");
    if (!token)
        return null;
    try {
        const { payload } = await jwtVerify(token, JWKS, {
            issuer: TEAM_DOMAIN,
        });
        const email = payload.email;
        const aud = payload.aud;
        const tier = aud === PREMIUM_AUD ? "pro" : "free";
        return { email, tier };
    }
    catch (err) {
        // It's useful to log the reason for verification failure for debugging.
        console.error("JWT verification failed:", err instanceof Error ? err.message : String(err));
        return null;
    }
}
//# sourceMappingURL=auth.js.map