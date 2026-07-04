import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";
import { isDatabaseConnectionError } from "../lib/db-errors";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  try {
    await pool.query("select 1");
    const data = HealthCheckResponse.parse({ status: "ok" });
    return res.json(data);
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      const data = HealthCheckResponse.parse({ status: "degraded" });
      return res.status(503).json(data);
    }
    const data = HealthCheckResponse.parse({ status: "error" });
    return res.status(500).json(data);
  }
});

export default router;
