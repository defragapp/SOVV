import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
      res(res)  { return { statusCode: res.statusCode }; },
    },
  }),
);

// CORS — allow credentials from any origin (both same-domain Replit and local dev)
app.use(cors({ origin: true, credentials: true }));

// Raw body for Stripe webhook signature verification — BEFORE express.json()
app.use("/api/stripe", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

export default app;
