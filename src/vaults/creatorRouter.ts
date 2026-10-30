import express from "express";
import { requirePrivyUser, requireTelosKey } from "../auth/auth.js";
import { provisionAgentKey } from "../llm/openRouterProvisioning.js";
import { insertDeployedStrategy, parseStrategyDraft } from "../strategies/deployedStrategies.js";
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
creatorRouter.post("/connect", requirePrivyUser, async (req, res) => {
  try {
    const walletAddress = String(req.body?.walletAddress || "");
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      res.status(400).json({ error: "walletAddress must be a 0x address" });
      return;
    }
    const creator = await upsertCreator(req.privyUserId!, walletAddress);
    const apiKey = await getOrCreateApiKey(creator.id);
    res.json({ creatorId: creator.id, walletAddress: creator.wallet_address, apiKey });
  } catch (error) {
    console.error("[creator/connect]", error);
    res.status(500).json({ error: "could not connect creator" });
  }
});

creatorRouter.get("/me", requireTelosKey, (req, res) => {
  const { id, wallet_address } = req.creator!;
  res.json({ creatorId: id, walletAddress: wallet_address });
});

// Deploys a strategy drafted in the strategy chat. It is listed on the public
// strategies page and can be picked when creating a vault.
creatorRouter.post("/strategies", requireTelosKey, async (req, res) => {
  const parsed = parseStrategyDraft(req.body);
  if (!parsed.value) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  try {
    const row = await insertDeployedStrategy(parsed.value, {
      source: "creator",
      creatorId: req.creator!.id,
      creatorWallet: req.creator!.wallet_address,
    });
    res.status(201).json({ strategy: { id: row.id, createdAt: row.created_at } });
  } catch (error) {
    console.error("[creator/strategies]", error);
    res.status(500).json({ error: "could not deploy strategy" });
  }
});

// Called right after the on-chain VaultFactory transaction succeeds.
creatorRouter.post("/vaults", requireTelosKey, async (req, res) => {
  try {
    const { chainId, onchainVaultId, vaultAddress, name, ticker, creatorFeeBps } = req.body ?? {};
    if (
      !Number.isInteger(chainId) ||
      !Number.isInteger(onchainVaultId) ||
      !/^0x[a-fA-F0-9]{40}$/.test(String(vaultAddress)) ||
      !name ||
      !ticker ||
      !Number.isInteger(creatorFeeBps)
    ) {
      res.status(400).json({ error: "chainId, onchainVaultId, vaultAddress, name, ticker, creatorFeeBps are required" });
      return;
    }
    const vault = await insertVault({
      creatorId: req.creator!.id,
      chainId,
      onchainVaultId,
      vaultAddress,
      name: String(name).slice(0, 100),
      ticker: String(ticker).slice(0, 20),
      creatorFeeBps,
    });
    res.status(201).json({ vault });
  } catch (error) {
    console.error("[creator/vaults]", error);
    res.status(500).json({ error: "could not save vault" });
  }
});

creatorRouter.get("/vaults", requireTelosKey, async (req, res) => {
  try {
    const vaults = (await listVaults()).filter((vault) => vault.creator_id === req.creator!.id);
    res.json({ vaults });
  } catch (error) {
    console.error("[creator/vaults:list]", error);
    res.status(500).json({ error: "could not list vaults" });
  }
});

// Plugs an agent into a vault. The OpenRouter sub-key is created here, on the
// server, and the schedule starts immediately via the AgentTasks row.
creatorRouter.post("/vaults/:vaultId/agent", requireTelosKey, async (req, res) => {
  try {
    const vaultId = Number(req.params.vaultId);
    const vault = await getVaultForCreator(vaultId, req.creator!.id);
    if (!vault) {
      res.status(404).json({ error: "vault not found" });
      return;
    }
    if (await getAgentForVault(vaultId)) {
      res.status(409).json({ error: "this vault already has an agent" });
      return;
    }

    const model = String(req.body?.model || "");
    if (!ALLOWED_MODELS.has(model)) {
      res.status(400).json({ error: "model is not on the allow-list" });
      return;
    }
    const rethinkIntervalMinutes = Number(req.body?.rethinkIntervalMinutes ?? 1440);
    if (!Number.isInteger(rethinkIntervalMinutes) || rethinkIntervalMinutes < 5) {
      res.status(400).json({ error: "rethinkIntervalMinutes must be an integer >= 5" });
      return;
    }

    const provisioned = await provisionAgentKey(`${vault.id}-${vault.vault_ticker}`);
    const agent = await insertAgentWithTask({
      creatorId: req.creator!.id,
      vaultId,
      model,
      openrouterKey: provisioned.key,
      openrouterKeyHash: provisioned.hash,
      rethinkIntervalMinutes,
    });
    const { openrouter_key: _secret, openrouter_key_hash: _hash, ...safeAgent } = agent;
    res.status(201).json({ agent: safeAgent });
  } catch (error) {
    console.error("[creator/agent]", error);
    res.status(500).json({ error: "could not create agent" });
  }
});

creatorRouter.get("/vaults/:vaultId/strategies", requireTelosKey, async (req, res) => {
  try {
    const vault = await getVaultForCreator(Number(req.params.vaultId), req.creator!.id);
    if (!vault) {
      res.status(404).json({ error: "vault not found" });
      return;
    }
    res.json({ strategies: await getStrategiesForVault(vault.id) });
  } catch (error) {
    console.error("[creator/strategies]", error);
    res.status(500).json({ error: "could not load strategies" });
  }
});
