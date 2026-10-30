import express from "express";
import { listDeployedStrategies } from "../strategies/deployedStrategies.js";

export const registryRouter = express.Router();

registryRouter.get("/strategies", async (req, res) => {
  try {
    res.json({ strategies: await listDeployedStrategies() });
  } catch (error) {
    console.error("[registry/strategies]", error);
    res.status(500).json({ error: "could not list strategies" });
  }
});
