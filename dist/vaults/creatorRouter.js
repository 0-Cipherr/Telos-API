import express from "express";
import { requirePrivyUser, requireTelosKey } from "../auth/auth.js";
import { provisionAgentKey } from "../llm/openRouterProvisioning.js";
import {
  insertDeployedStrategy,
  parseStrategyDraft,
} from "../strategies/deployedStrategies.js";
import { validateStrategyContract } from "../strategies/validateStrategyContract.js";
import {
  getAgentForVault,
  getOrCreateApiKey,
  getStrategiesForVault,
  getVaultForCreator,
  insertAgentWithTask,
  insertVault,
  listVaults,
  upsertCreator,
} from "../db/telos-queries.js";
export const creatorRouter = express.Router();
const ALLOWED_MODELS = new Set([
  "openai/gpt-4o-mini",
  "openai/gpt-4.1-mini",
  "anthropic/claude-3.5-haiku",
  "google/gemini-2.5-flash",
  "meta-llama/llama-3.3-70b-instruct",
  "deepseek/deepseek-chat-v3",
  "qwen/qwen-2.5-coder-32b-instruct",
  "mistralai/mistral-large",
  "cohere/north-mini-code:free",
  "nvidia/nemotron-3.5-lightning:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
]);
// First wallet connect: the Privy token proves who the user is, and we hand
// back the Telos API key. The frontend stores it and sends it automatically.

creatorRouter.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const result = await;
  } catch (error) {
    console.log(error);
  }
});

