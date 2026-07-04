import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { isAllowedOrigin } from "./lib/origins";

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

// CORS — allow credentials only from configured origins.
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      // Allow non-browser or same-origin requests without an Origin header.
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);
      logger.warn({ origin }, "Blocked CORS origin");
      return callback(null, false);
    },
  }),
);

// Raw body for Stripe webhook signature verification — BEFORE express.json()
app.use("/api/stripe", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

export default app;
