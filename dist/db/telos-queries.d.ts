export type Creator = {
    id: number;
    privy_user_id: string;
    wallet_address: string;
};
export type VaultRow = {
    id: number;
    creator_id: number;
    chain_id: number;
    onchain_vault_id: number;
    vault_address: string;
    vault_name: string;
    vault_ticker: string;
    creator_fee_bps: number;
    protocol_fee_bps: number;
};
export type AgentRow = {
    id: number;
    creator_id: number;
    vault_id: number;
    model: string;
    openrouter_key: string;
    openrouter_key_hash: string;
    rethink_interval_minutes: number;
};
export type DueTask = {
    task_id: number;
    agent_id: number;
    vault_id: number;
    model: string;
    openrouter_key: string;
    rethink_interval_minutes: number;
    chain_id: number;
    vault_name: string;
};
export type StrategyInput = {
    vaultId: number;
    agentId: number | null;
    name: string;
    description: string;
    protocol: string;
    chainId: number;
    contractAddress: string | null;
    entryPoint: string | null;
    exitPoint: string | null;
    apy: number;
    riskLevel: number | null;
    configuration: Record<string, unknown>;
};
export declare function upsertCreator(privyUserId: string, walletAddress: string): Promise<Creator>;
export declare function getOrCreateApiKey(creatorId: number): Promise<string>;
export declare function findCreatorByApiKey(apiKey: string): Promise<Creator | null>;
export declare function insertVault(input: {
    creatorId: number;
    chainId: number;
    onchainVaultId: number;
    vaultAddress: string;
    name: string;
    ticker: string;
    creatorFeeBps: number;
}): Promise<VaultRow>;
export declare function getVaultForCreator(vaultId: number, creatorId: number): Promise<VaultRow | null>;
export declare function listVaults(): Promise<any[]>;
export declare function getAgentForVault(vaultId: number): Promise<AgentRow | null>;
export declare function insertAgentWithTask(input: {
    creatorId: number;
    vaultId: number;
    model: string;
    openrouterKey: string;
    openrouterKeyHash: string;
    rethinkIntervalMinutes: number;
}): Promise<AgentRow>;
export declare function getDueAgentTasks(limit: number): Promise<DueTask[]>;
export declare function markTaskRan(taskId: number, intervalMinutes: number, error: string | null): Promise<void>;
export declare function getStrategiesForVault(vaultId: number): Promise<any[]>;
export declare function insertStrategy(input: StrategyInput): Promise<any>;
export declare function setCurrentStrategy(vaultId: number, strategyId: string): Promise<void>;
//# sourceMappingURL=telos-queries.d.ts.map