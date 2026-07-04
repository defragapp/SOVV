import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const proxyRouter = Router();

const UPSTREAM = "https://api.defrag.app";

const proxy = createProxyMiddleware({
  target: UPSTREAM,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      proxyReq.setHeader("X-Forwarded-Host", req.headers.host || "");
      proxyReq.setHeader("X-Forwarded-Proto", "https");
    },
    error: (err, _req, res: any) => {
      console.error("[proxy] upstream error:", err.message);
      if (!res.headersSent) res.status(502).json({ error: "Upstream unavailable" });
    },
  },
});

// Routes NOT listed here are handled locally (auth, user, baseline, billing, covenants, archive, stripe).
// Only forward routes that have no local implementation.
proxyRouter.use(["/chips", "/history", "/patterns", "/admin", "/invite", "/promo"], proxy);

export default proxyRouter;
