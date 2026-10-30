import pool from "../db/pool.js";

// Chains a strategy can be deployed on, by the names the frontend uses.
export const STRATEGY_CHAIN_IDS: Record<string, number> = {
  Ethereum: 1,
  Optimism: 10,
  Polygon: 137,
  Gnosis: 100,
  Base: 8453,
  Arbitrum: 42161,
  Linea: 59144,
  Scroll: 534352,
  Blast: 81457,
  Mantle: 5000,
  Celo: 42220,
  Avalanche: 43114,
  Telos: 40,
  "Robinhood Testnet": 46630,
};

const CHAIN_NAMES = new Map(Object.entries(STRATEGY_CHAIN_IDS).map(([name, id]) => [id, name]));

const RISK_LEVEL: Record<string, number> = { LOW: 1, MED: 3, HIGH: 5 };

export type Allocation = { label: string; pct: number };

export type StrategyDraft = {
  name: string;
  ticker: string;
  chain: string;
  asset: string;
  risk: "LOW" | "MED" | "HIGH";
  fee: number;
  thesis: string;
  allocations: Allocation[];
  guardrails: string[];
  contractName: string;
  contractCode: string;
  model: string;
  auditStatus: string;
};

export type StrategyOrigin = {
  source: "creator" | "seed";
  creatorId?: number;
  creatorWallet?: string;
};

export type DeployedStrategy = {
  id: string;
  name: string;
  ticker: string;
  chain: string;
  chainId: number;
  asset: string;
  risk: "LOW" | "MED" | "HIGH";
  fee: number;
  thesis: string;
  allocations: Allocation[];
  guardrails: string[];
  apy: number;
  auditStatus: string;
  creatorAddress: string | null;
  createdAt: string;
};

const str = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export function parseStrategyDraft(body: unknown): { value?: StrategyDraft; error?: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = str(b.name, 100);
  const ticker = str(b.ticker, 8).toUpperCase();
  const chain = str(b.chain, 64);
  const asset = str(b.asset, 20);
  const thesis = str(b.thesis, 2000);
  const contractCode = typeof b.contractCode === "string" ? b.contractCode : "";

  if (!name || !ticker || !asset || !thesis) {
    return { error: "name, ticker, asset and thesis are required" };
  }
  if (!(chain in STRATEGY_CHAIN_IDS)) {
    return { error: `chain must be one of: ${Object.keys(STRATEGY_CHAIN_IDS).join(", ")}` };
  }
  if (!["LOW", "MED", "HIGH"].includes(String(b.risk))) {
    return { error: "risk must be LOW, MED or HIGH" };
  }
  const fee = Number(b.fee);
  if (!Number.isFinite(fee) || fee < 0 || fee > 8) {
    return { error: "fee must be between 0 and 8" };
  }
  if (!/contract\s+[A-Za-z_]\w*\s+is\s+IStrategy/.test(contractCode)) {
    return { error: "contractCode must be an IStrategy Solidity contract" };
  }

  const allocations = Array.isArray(b.allocations)
    ? b.allocations
        .map((item) => {
          const row = (item ?? {}) as Record<string, unknown>;
          return { label: str(row.label, 120), pct: Number(row.pct) };
        })
        .filter((item) => item.label && Number.isFinite(item.pct) && item.pct > 0)
    : [];
  if (allocations.length === 0) return { error: "at least one allocation is required" };
  const total = allocations.reduce((sum, item) => sum + item.pct, 0);
  if (Math.abs(total - 100) > 1) return { error: "allocations must add up to 100%" };

  const guardrails = Array.isArray(b.guardrails)
    ? b.guardrails.map((item) => str(item, 300)).filter(Boolean).slice(0, 12)
    : [];

  return {
    value: {
      name,
      ticker,
      chain,
      asset,
      risk: b.risk as StrategyDraft["risk"],
      fee,
      thesis,
      allocations,
      guardrails,
      contractName: str(b.contractName, 100),
      contractCode,
      model: str(b.model, 100),
      auditStatus: str(b.auditStatus, 100) || "unaudited",
    },
  };
}

export async function insertDeployedStrategy(draft: StrategyDraft, origin: StrategyOrigin, apy = 0) {
  const { rows } = await pool.query<{ id: string; created_at: Date }>(
    `INSERT INTO Strategies
       (name, description, protocol, chain_id, apy, risk_level, status, configuration, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8)
     RETURNING id, created_at`,
    [
      draft.name,
      draft.thesis,
      draft.allocations[0]?.label.slice(0, 100) ?? draft.asset,
      STRATEGY_CHAIN_IDS[draft.chain],
      apy,
      RISK_LEVEL[draft.risk],
      JSON.stringify({
        ticker: draft.ticker,
        chain: draft.chain,
        asset: draft.asset,
        risk: draft.risk,
        fee: draft.fee,
        allocations: draft.allocations,
        guardrails: draft.guardrails,
        contractName: draft.contractName,
        contractCode: draft.contractCode,
        model: draft.model,
        auditStatus: draft.auditStatus,
      }),
      JSON.stringify({
        source: origin.source,
        creatorId: origin.creatorId ?? null,
        creatorWallet: origin.creatorWallet ?? null,
      }),
    ],
  );
  return rows[0]!;
}

export async function listDeployedStrategies(): Promise<DeployedStrategy[]> {
  const { rows } = await pool.query(
    `SELECT id, name, description, chain_id, apy, risk_level, configuration, metadata, created_at
     FROM Strategies
     WHERE vault_id IS NULL AND status = 'active'
     ORDER BY created_at DESC
     LIMIT 200`,
  );
  return rows.map((row) => {
    const config = row.configuration as Record<string, any>;
    const meta = row.metadata as Record<string, any>;
    const risk = (config.risk ?? (row.risk_level >= 4 ? "HIGH" : row.risk_level >= 2 ? "MED" : "LOW")) as DeployedStrategy["risk"];
    return {
      id: row.id,
      name: row.name,
      ticker: config.ticker ?? "",
      chain: CHAIN_NAMES.get(row.chain_id) ?? String(row.chain_id),
      chainId: row.chain_id,
      asset: config.asset ?? "",
      risk,
      fee: Number(config.fee ?? 0),
      thesis: row.description ?? "",
      allocations: (config.allocations ?? []) as Allocation[],
      guardrails: (config.guardrails ?? []) as string[],
      apy: Number(row.apy),
      auditStatus: config.auditStatus ?? "unaudited",
      creatorAddress: meta.creatorWallet ?? null,
      createdAt: new Date(row.created_at).toISOString(),
    };
  });
}
