const fs = require('fs');
const path = '/workspaces/SOVV/apps/worker/src/index.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'router.get("/api/health", () => new Response(JSON.stringify({ status: "ok", timestamp: Date.now() }), { status: 200, headers: { "Content-Type": "application/json" } }));',
  `router.get('/health', () => {
  return new Response(JSON.stringify({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: { db: true, kv: true, ai: true }
  }), { headers: { 'Content-Type': 'application/json' } });
});`
);

code = code.replace(
  `    try {\n      return await handleWithCors(request, env, ctx);\n    } catch (error) {\n      console.error("Worker fetch error:", error);\n      return new Response("Internal Server Error", { status: 500 });\n    }`,
  `    try {\n      return await handleWithCors(request, env, ctx);\n    } catch (error) {\n      console.error("[INTERNAL]", error);\n      return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });\n    }`
);

code = code.replace(
  `  const cors = getCorsHeaders(request);\n  Object.entries(cors).forEach(([key, value]) => {\n    corsResponse.headers.set(key, value);\n  });\n  \n  return corsResponse;`,
  `  const cors = getCorsHeaders(request);\n  Object.entries(cors).forEach(([key, value]) => {\n    corsResponse.headers.set(key, value);\n  });\n  \n  const securityHeaders = {\n    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',\n    'X-Frame-Options': 'DENY',\n    'X-Content-Type-Options': 'nosniff',\n    'Referrer-Policy': 'strict-origin-when-cross-origin',\n    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',\n  };\n  Object.entries(securityHeaders).forEach(([key, value]) => {\n    corsResponse.headers.set(key, value);\n  });\n  \n  return corsResponse;`
);

fs.writeFileSync(path, code);
