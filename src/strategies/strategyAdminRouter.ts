import { timingSafeEqual } from "node:crypto";
import express, { type NextFunction, type Request, type Response } from "express";
import {
  createScheduledStrategy,
  listScheduledStrategies,
  parseScheduledStrategy,
} from "./scheduledStrategies.js";

export const strategyAdminRouter = express.Router();

// Only you should post strategies. Requests need the ADMIN_API_TOKEN header.
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_API_TOKEN || "";
  const given = String(req.headers["x-admin-token"] || "");
  const matches =
    expected.length > 0 &&
    given.length === expected.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!matches) {
    res.status(401).json({ error: "admin token required" });
    return;
  }
  next();
}

strategyAdminRouter.use(requireAdmin);

// Example body:
// { "name": "ETH carry", "protocol": "Aave", "chainId": 421614,
//   "description": "...", "apy": 4.2, "riskLevel": 2,
//   "intervalDays": 7, "startAt": "2026-11-02T09:00:00Z", "vaultId": null }
strategyAdminRouter.post("/scheduled-strategies", async (req, res) => {
  const parsed = parseScheduledStrategy(req.body);
  if (!parsed.value) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  try {
    const release = await createScheduledStrategy(parsed.value);
    res.status(201).json({ release });
  } catch (error) {
    console.error("[admin/scheduled-strategies]", error);
    res.status(500).json({ error: "could not schedule strategy" });
  }
});

strategyAdminRouter.get("/scheduled-strategies", async (_req, res) => {
  try {
    res.json({ releases: await listScheduledStrategies() });
  } catch (error) {
    console.error("[admin/scheduled-strategies:list]", error);
    res.status(500).json({ error: "could not list scheduled strategies" });
  }
});
