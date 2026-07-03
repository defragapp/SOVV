import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const proxyRouter = Router();

const UPSTREAM = "https://api.defrag.app";

const proxy = createProxyMiddleware({
  target: UPSTREAM,
  changeOrigin: true,
  // Forward cookies so session-based auth passes through
  on: {
    proxyReq: (proxyReq, req) => {
      // Forward original host so the upstream can set cookies correctly
      proxyReq.setHeader("X-Forwarded-Host", req.headers.host || "");
      proxyReq.setHeader("X-Forwarded-Proto", "https");
    },
    error: (err, _req, res: any) => {
      console.error("[proxy] upstream error:", err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: "Upstream unavailable" });
      }
    },
  },
});

// Proxy all routes handled by the upstream API
// NOTE: /explain is handled locally by the AI route — do NOT add it here
proxyRouter.use(
  [
    "/auth",
    "/user",
    "/baseline",
    "/chips",
    "/history",
    "/patterns",
    "/billing",
    "/admin",
    "/invite",
    "/promo",
  ],
  proxy,
);

export default proxyRouter;
