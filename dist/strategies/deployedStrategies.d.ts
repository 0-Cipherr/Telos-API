export declare const STRATEGY_CHAIN_IDS: Record<string, number>;
export type Allocation = {
    label: string;
    pct: number;
};
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
export declare function parseStrategyDraft(body: unknown): {
    value?: StrategyDraft;
    error?: string;
};
export declare function insertDeployedStrategy(draft: StrategyDraft, origin: StrategyOrigin, apy?: number): Promise<{
    id: string;
    created_at: Date;
}>;
export declare function listDeployedStrategies(): Promise<DeployedStrategy[]>;
//# sourceMappingURL=deployedStrategies.d.ts.map