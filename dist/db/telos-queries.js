import { randomBytes } from "node:crypto";
import pool from "./pool.js";
export async function upsertCreator(privyUserId, walletAddress) {
    const { rows } = await pool.query(`INSERT INTO Creators (privy_user_id, wallet_address) VALUES ($1, $2)
     ON CONFLICT (privy_user_id) DO UPDATE SET wallet_address = EXCLUDED.wallet_address
     RETURNING id, privy_user_id, wallet_address`, [privyUserId, walletAddress.toLowerCase()]);
    return rows[0];
}
export async function getOrCreateApiKey(creatorId) {
    const existing = await pool.query("SELECT api_key FROM TelosApiKeys WHERE creator_id = $1 ORDER BY id LIMIT 1", [creatorId]);
    if (existing.rows[0])
        return existing.rows[0].api_key;
    const key = `telos_${randomBytes(24).toString("hex")}`;
    await pool.query("INSERT INTO TelosApiKeys (creator_id, api_key) VALUES ($1, $2)", [creatorId, key]);
    return key;
}
export async function findCreatorByApiKey(apiKey) {
    const { rows } = await pool.query(`SELECT c.id, c.privy_user_id, c.wallet_address
     FROM TelosApiKeys k JOIN Creators c ON c.id = k.creator_id
     WHERE k.api_key = $1`, [apiKey]);
    return rows[0] ?? null;
}
export async function insertVault(input) {
    const { rows } = await pool.query(`INSERT INTO Vaults
       (creator_id, chain_id, onchain_vault_id, vault_address, vault_name, vault_ticker, creator_fee_bps)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (chain_id, onchain_vault_id) DO UPDATE SET vault_name = EXCLUDED.vault_name
     RETURNING *`, [
        input.creatorId,
        input.chainId,
        input.onchainVaultId,
        input.vaultAddress.toLowerCase(),
        input.name,
        input.ticker,
        input.creatorFeeBps,
    ]);
    return rows[0];
}
export async function getVaultForCreator(vaultId, creatorId) {
    const { rows } = await pool.query("SELECT * FROM Vaults WHERE id = $1 AND creator_id = $2", [vaultId, creatorId]);
    return rows[0] ?? null;
}
export async function listVaults() {
    const { rows } = await pool.query(`SELECT v.*, c.wallet_address AS creator_address,
            cs.strategy_id AS current_strategy_id
     FROM Vaults v
     JOIN Creators c ON c.id = v.creator_id
     LEFT JOIN CurrentStrategy cs ON cs.vault_id = v.id
     ORDER BY v.created_at DESC`);
    return rows;
}
export async function getAgentForVault(vaultId) {
    const { rows } = await pool.query("SELECT * FROM Agents WHERE vault_id = $1", [vaultId]);
    return rows[0] ?? null;
}
export async function insertAgentWithTask(input) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const agent = await client.query(`INSERT INTO Agents
         (creator_id, vault_id, model, openrouter_key, openrouter_key_hash, rethink_interval_minutes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [
            input.creatorId,
            input.vaultId,
            input.model,
            input.openrouterKey,
            input.openrouterKeyHash,
            input.rethinkIntervalMinutes,
        ]);
        const row = agent.rows[0];
        await client.query("INSERT INTO AgentTasks (agent_id, vault_id, next_run_at) VALUES ($1, $2, NOW())", [row.id, input.vaultId]);
        await client.query("COMMIT");
        return row;
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
export async function getDueAgentTasks(limit) {
    const { rows } = await pool.query(`SELECT t.id AS task_id, a.id AS agent_id, a.vault_id, a.model,
            a.openrouter_key, a.rethink_interval_minutes,
            v.chain_id, v.vault_name
     FROM AgentTasks t
     JOIN Agents a ON a.id = t.agent_id
     JOIN Vaults v ON v.id = t.vault_id
     WHERE t.status = 'scheduled' AND t.next_run_at <= NOW()
     ORDER BY t.next_run_at
     LIMIT $1`, [limit]);
    return rows;
}
export async function markTaskRan(taskId, intervalMinutes, error) {
    await pool.query(`UPDATE AgentTasks
     SET last_run_at = NOW(),
         last_error = $2,
         next_run_at = NOW() + make_interval(mins => $3)
     WHERE id = $1`, [taskId, error, intervalMinutes]);
}
export async function getStrategiesForVault(vaultId) {
    const { rows } = await pool.query(`SELECT id, name, description, protocol, chain_id, contract_address,
            entry_point, exit_point, apy, risk_level, status, configuration, created_at
     FROM Strategies WHERE vault_id = $1 ORDER BY created_at DESC`, [vaultId]);
    return rows;
}
export async function insertStrategy(input) {
    const { rows } = await pool.query(`INSERT INTO Strategies
       (vault_id, agent_id, name, description, protocol, chain_id, contract_address,
        entry_point, exit_point, apy, risk_level, configuration)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`, [
        input.vaultId,
        input.agentId,
        input.name,
        input.description,
        input.protocol,
        input.chainId,
        input.contractAddress,
        input.entryPoint,
        input.exitPoint,
        input.apy,
        input.riskLevel,
        JSON.stringify(input.configuration),
    ]);
    return rows[0];
}
export async function setCurrentStrategy(vaultId, strategyId) {
    await pool.query(`INSERT INTO CurrentStrategy (vault_id, strategy_id) VALUES ($1, $2)
     ON CONFLICT (vault_id) DO UPDATE SET strategy_id = EXCLUDED.strategy_id, updated_at = NOW()`, [vaultId, strategyId]);
}
//# sourceMappingURL=telos-queries.js.map