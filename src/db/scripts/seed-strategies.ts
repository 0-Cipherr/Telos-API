// Seeds starter strategies so the Strategies page has entries on several
// chains before real creators deploy. Safe to re-run: a seed row with the same
// name is skipped. Run with `npm run seed:strategies` (needs the DB up).
import "dotenv/config";
import pool from "../pool.js";
import { insertDeployedStrategy, type StrategyDraft } from "../../strategies/deployedStrategies.js";

const SEEDS: { apy: number; draft: StrategyDraft }[] = [
  {
    apy: 4.2,
    draft: {
      name: "USDC Lending Base",
      ticker: "USDCB",
      chain: "Base",
      asset: "USDC",
      risk: "LOW",
      fee: 2,
      thesis:
        "Supply USDC into overcollateralised lending markets on Base and keep most of the book in the deepest pool. Capital preservation first; rotate only when the spread against idle cash is clearly positive.",
      allocations: [
        { label: "Lending market — USDC supply", pct: 80 },
        { label: "Idle buffer — withdrawable", pct: 20 },
      ],
      guardrails: ["No leverage.", "Pause deposits if oracle staleness exceeds 15 minutes."],
      contractName: "",
      contractCode: "",
      model: "seed",
      auditStatus: "seed (not audited)",
    },
  },
  {
    apy: 6.8,
    draft: {
      name: "ETH Carry Arbitrum",
      ticker: "ETHC",
      chain: "Arbitrum",
      asset: "WETH",
      risk: "MED",
      fee: 3,
      thesis:
        "Earn lending yield on WETH collateral on Arbitrum and hedge the price leg with a short perp leg when funding is positive. Balanced risk; the hedge is trimmed when funding flips.",
      allocations: [
        { label: "Lending — WETH supply", pct: 60 },
        { label: "Funding carry — hedged short", pct: 25 },
        { label: "Idle buffer", pct: 15 },
      ],
      guardrails: ["Max 1.25x exposure.", "Rebalance on 5% allocation drift."],
      contractName: "",
      contractCode: "",
      model: "seed",
      auditStatus: "seed (not audited)",
    },
  },
  {
    apy: 3.9,
    draft: {
      name: "Stable Yield Ethereum",
      ticker: "STBL",
      chain: "Ethereum",
      asset: "USDC",
      risk: "LOW",
      fee: 2,
      thesis:
        "Hold USDC in blue-chip money markets on Ethereum mainnet. Lowest-risk sleeve in the set; the strategy favours liquidity over headline yield.",
      allocations: [{ label: "Money market — USDC supply", pct: 100 }],
      guardrails: ["No leverage.", "Withdraw-only mode if TVL drops 30% in 24 hours."],
      contractName: "",
      contractCode: "",
      model: "seed",
      auditStatus: "seed (not audited)",
    },
  },
  {
    apy: 9.1,
    draft: {
      name: "LP Fees Optimism",
      ticker: "LPOP",
      chain: "Optimism",
      asset: "WETH",
      risk: "HIGH",
      fee: 4,
      thesis:
        "Concentrated liquidity on a volatile WETH/USDC pool on Optimism to capture swap fees. Higher yield with divergence-loss risk; the range is re-centred monthly or on a large move.",
      allocations: [
        { label: "Concentrated WETH/USDC LP", pct: 70 },
        { label: "Idle buffer", pct: 30 },
      ],
      guardrails: ["Max 2x leverage; auto-deleverage at 15% drawdown.", "Re-centre range on 3% drift."],
      contractName: "",
      contractCode: "",
      model: "seed",
      auditStatus: "seed (not audited)",
    },
  },
  {
    apy: 5.5,
    draft: {
      name: "USDC Yield Robinhood Testnet",
      ticker: "RHUSD",
      chain: "Robinhood Testnet",
      asset: "USDC",
      risk: "MED",
      fee: 3,
      thesis:
        "Deposits settle on Robinhood Testnet, and this strategy keeps a USDC sleeve there while the rest routes to supported chains where the yield clears the cost. Balanced risk, rebalanced monthly.",
      allocations: [
        { label: "Local USDC sleeve", pct: 50 },
        { label: "Cross-chain lending sleeve", pct: 40 },
        { label: "Idle buffer", pct: 10 },
      ],
      guardrails: ["No leverage above 1.25x.", "Rebalance monthly or on 5% drift."],
      contractName: "",
      contractCode: "",
      model: "seed",
      auditStatus: "seed (not audited)",
    },
  },
];

async function main() {
  let inserted = 0;
  for (const seed of SEEDS) {
    const existing = await pool.query(
      "SELECT 1 FROM Strategies WHERE name = $1 AND metadata->>'source' = 'seed'",
      [seed.draft.name],
    );
    if (existing.rowCount) continue;
    await insertDeployedStrategy(seed.draft, { source: "seed" }, seed.apy);
    inserted += 1;
  }
  console.log(`[seed:strategies] inserted ${inserted} of ${SEEDS.length} strategies`);
}

main()
  .catch((error) => {
    console.error("[seed:strategies] failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
