import type { QueryResult } from "pg";
import type { address } from "../../types/OnchainTypes.js";
import pool from "../pool.js";

export async function getAllVaults() {
  try {
    await pool.connect();
    const results = await pool.query("SELECT * FROM Vaults");
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getAllDepositors() {
  try {
    await pool.connect();
    const results = await pool.query("SELECT * FROM depositors");
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function allChains(
  chainId: number,
  endpointId: number,
  endpoint: address,
) {
  try {
    await pool.connect();
    const results = await pool.query("SELECT * FROM Chains");
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function vaultReturns() {
  try {
    await pool.connect();
    const results = await pool.query("SELECT * FROM VaultReturns");
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function insertVaultReturns() {
  try {
    await pool.connect();
    const results = await pool.query("SELECT * FROM VaultReturns");
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function allAgents() {
  try {
    await pool.connect();
    const results = await pool.query("SELECT * FROM Agents");
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function insertAgent(
  llm: any,
  key: string,
  creatorId: number,
  walletReference: number,
  model: string,
) {
  try {
    await pool.connect();
    const results = await pool.query(
      "INSERT INTO Agents (llm, key, creatorId, walletReference, model) VALUES ($1, $2, $3, $4, $5)",
      [llm, key, creatorId, walletReference, model],
    );
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function allAgentFourms() {
  try {
    await pool.connect();
    const results = await pool.query("SELECT * FROM AgentFourms");
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function insertAgentFourm(agentId: number, thesis: any) {
  try {
    await pool.connect();
    const results = await pool.query(
      "INSERT INTO AgentTask (agentId, theseis) VALUES ($1, $1)",
      [agentId, thesis],
    );
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function allAgentTasks() {
  try {
    await pool.connect();
    const results = await pool.query("SELECT * FROM AgentTask");
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function insertAgentTask() {
  try {
    await pool.connect();
    const results = await pool.query(
      "INSERT INTO AgentTask (agentId, vaultId) VALUES ($1, $2",
    );
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function allApiKeys() {
  try {
    await pool.connect();
    const results = await pool.query("SELECT * FROM TelosAPIKy");
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function insertAPIKey(creatorId: number, key: string) {
  try {
    await pool.connect();
    const results = await pool.query(
      "INSERT INTO TelosAPIKy (creatorId ,KEY) VALUES ($1, $2)",
      [creatorId, key],
    );
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function insertChain(
  chainId: number,
  endpointId: number,
  endpoint: address,
) {
  try {
    await pool.connect();
    const results = await pool.query(
      "INSERT INTO Chains(chainId, endpointId, endpoint) VALUES ($1, $2, $3)",
      [chainId, endpointId, , endpoint],
    );
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function insertDepositors(creatorId: number, vaultId: number) {
  try {
    await pool.connect();
    const results = await pool.query(
      "INSERT INTO Depositors(creatorId, vaultId) VALUES ($1, $2)",
      [creatorId, vaultId],
    );
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function getAllCreators() {
  try {
    await pool.connect();
    const results = await pool.query("SELECT * FROM creators");
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function insertCreator(creatorAddress: address) {
  try {
    await pool.connect();
    const results = await pool.query(
      "INSERT INTO Creators (creatorAddress), VALUES ($1)",
      [creatorAddress as string],
    );
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getCreatorById(id: number) {
  try {
    await pool.connect();
    const results = await pool.query("SELECT FROM Creators WHERE id = $1", [
      id,
    ]);
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getCreatorByAddress(creatorAddress: address) {
  try {
    await pool.connect();
    const results = await pool.query(
      "SELECT FROM Creators WHERE creatorAddress = $1",
      [creatorAddress as string],
    );
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function insertVault(
  vaultName: string,
  vaultTicker: string,
  vaultChains: any[],
  chainId: number,
  creatorId: string[],
) {
  try {
    await pool.connect();
    const results = await pool.query(
      "INSERT INTO Vaults (vaultName,vaultTicker,,aultChains, chainId. creatorId), VALUES ($1, $2, $3. $4, $5)",
      [vaultName, vaultTicker, vaultChains, chainId, creatorId],
    );
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getVaultById(vaultId: Number) {
  try {
    await pool.connect();
    const results = await pool.query("SELECT * FROM Vaults WHERE id = $1", [
      vaultId,
    ]);
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getVaultbyName(vaultId: Number) {
  try {
    await pool.connect();
    const results = await pool.query("SELECT * FROM Vaults WHERE name = $1", [
      vaultId,
    ]);
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getVaultByTicker(vaultTicker: string) {
  try {
    await pool.connect();
    const results = await pool.query("SELECT * FROM Vaults WHERE ticker = $1", [
      vaultTicker,
    ]);
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getVaultByChainId(chainIdPrimary: Number) {
  try {
    await pool.connect();
    const results = await pool.query(
      "SELECT * FROM Vaults WHERE chainId = $1",
      [chainIdPrimary],
    );
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getVaultByCreatorId(creatorId: Number) {
  try {
    await pool.connect();
    const results = await pool.query(
      "SELECT * FROM Vaults WHERE creatorId = $1",
      [creatorId],
    );
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getDepositorsById(creatorId: Number) {
  try {
    await pool.connect();
    const results = await pool.query(
      "SELECT * FROM Depositors WHERE creatorId = $1",
      [creatorId],
    );
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getVaultByCreatorAddress(creatorAddress: address) {
  try {
    await pool.connect();
    const results = await pool.query(
      "SELECT * FROM Vaults WHERE chainId = $1",
      [creatorAddress as string],
    );
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getVaultByName(name: string) {
  try {
    await pool.connect();
    const results = await pool.query("SELECT * FROM Vaults WHERE name = $1", [
      name,
    ]);
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getVaultByChain(chainId: Number) {
  try {
    await pool.connect();
    const results = await pool.query(
      "SELECT * FROM Vaults WHERE $1 = ANY(vaultChains)",
      [chainId],
    );
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getAbiByAddress(contractAddress: address) {
  try {
    await pool.connect();

    const results: QueryResult<any> = await pool.query(
      `SELECT abi FROM Deployments WHERE contractAddress = $1`,
      [contractAddress],
    );
    return results || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export function filterABI(name: string, chainId: Number, deployments: any[]) {
  try {
    let found = null;
    for (const deployment in deployments) {
      if (
        deployments[deployment].name == name &&
        deployments[deployment].chainId == chainId
      ) {
        const chains: any[] = deployments[deployment].vaultChains;
        found = deployments[deployment];
      }
    }
    return found;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function filterContract(
  name: string,
  chainId: Number,
  deployments: any[],
) {
  try {
    let found = null;
    for (const deployment in deployments) {
      if (
        deployments[deployment].name == name &&
        deployments[deployment].chainId == chainId
      ) {
        const chains: any[] = deployments[deployment].vaultChains;
        found = deployments[deployment];
      }
    }
    return found;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getDeploymentContract() {
  return "";
}
export async function getAllStrategies() {
  try {
    const results = await pool.query("SELECT * FROM Strategies");

    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getStrategyById(id: string) {
  try {
    const results = await pool.query("SELECT * FROM Strategies WHERE id = $1", [
      id,
    ]);

    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function insertStrategy(strategy: any[]) {
  try {
    const results = await pool.query(
      `INSERT INTO Strategies
       (name, protocol, chainId, contractAddress,
        assetAddress, creatorAddress, configuration)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name,
        protocol,
        chainId,
        contractAddress,
        creatorAddress,
        JSON.stringify(configuration),
      ],
    );

    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}
