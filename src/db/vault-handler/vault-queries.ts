import type { QueryResult } from "pg";
import type { address } from "../../types/OnchainTypes.js";
import pool from "../pool.js";
import type { VaultSeedConfig } from "../../types/DBTypes.js";

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

export async function getAggrVaultInfo(
  vaultId: number,
  isSeedCall: boolean,
  getCreatorInfo: boolean,
  getChainConfigsInfo: boolean,
): Promise<any | null> {
  try {
    const conditionalVaultInfoQuery: string | null = isSeedCall
      ? `vaults.vaultName, vaults.vaultTicker,`
      : null;

    const conditionalCreatorInfoQuery: string | null = getCreatorInfo
      ? `telosUser.address, telosUser.volume, telosUser.feesEarned,`
      : null;

    const conditionalchainsConfigsQuery: string = ``;
    const result = await pool.query(`
       SELECT vaults.vaultName, ${conditionalVaultInfoQuery} ${conditionalCreatorInfoQuery} 
`);
  } catch (error) {
    console.log(error);
  }
}

export async function getTelosUser(creatorId: number) {
  try {
    const result = await pool.query(
      `
    SELECT * FROM TelosUsers WHERE id = $1
    `,
      [creatorId],
    );

    return result.rows[0] || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function inserTelosUser(
  address: string,
  volume: number,
  feesEarned: number,
) {
  try {
    const result = await pool.query(
      `
    INSERT INTO TelosUsers (address, volume, feesEarned) VALUES ($1, $2, $3)
    `,
      [address, volume, feesEarned],
    );
    return result.rows[0] || {};
  } catch (error) {
    console.log(error);
    return {};
  }
}

export async function updateTelosUserVolume(creatorId: number, volume: number) {
  try {
    const telosUser: any = await getTelosUser(creatorId);
    const volumeAdded: number = telosUser?.volume + volume;
    const result = await pool.query(
      `
INSERT INTO TelosUsers (volume) VALUE ($1) WHERE CreatorId = $2
`,
      [volume, creatorId],
    );

    return result.rows[0] || {};
  } catch (error) {
    console.log(error);
    return {};
  }
}

export async function upateTelosUserFeesEarned(creatorId: number) {
  try {
    const telosUser = await getTelosUser(creatorId);
    const result = await pool.query(
      `INSERT INTO TelosUsers (feesEarned) VALUES ($1) WHERE CreatorId = $2 `,
      [telosUser?.feesEarned, creatorId],
    );

    return result.rows[0] || {};
  } catch (error) {
    console.log(error);
    return {};
  }
}

export async function getDeployments() {
  try {
    await pool.connect();
    const results = await pool.query("SELECT * FROM DeploymentsManager");
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

export async function insertTelosAgent(
  is_seed: boolean,
  walletAddress: String,
  userId: Number,
  agentUserName: String,
) {
  try {
    const result = await pool.query(
      "INSERT INTO TelosAgent (walletAddress, userId, creatorUserName)",
      [walletAddress, userId, agentUserName],
    );
    return result.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function insertVault(
  vaultName: String,
  vaultTicker: String,
  creatorId: Number,
  chainsConfigsId: Number,
): Promise<Number | null> {
  try {
    const result: any = await pool.query(
      "INSERT INTO Vaults (vaultName, vaultTicker, creatorId, chainsConfigsId) VALUES ($1, $2, $3, $4)",
      [vaultName, vaultTicker, creatorId, chainsConfigsId],
    );

    return result.rows?.id || null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function insertVaultCollection(
  vaultId: number,
  chainsConfigsId: Number,
) {}

export async function getVaultCollectionByVaultId(vaultId: number) {
  try {
    const result = await pool.query(
      `SELECT * FROM VaultsCollection as vs JOIN vault as v ON vc.vaultId = v.id  WHERE vaultId = $1`,
      [vaultId],
    );
    return result.rows[0] || {};
  } catch (error) {
    console.log(error);
    return {};
  }
}

export async function insertVaultsCollection(
  chainsConfigsId: Number,
  vaultId: Number,
) {
  try {
    const seedResult = await pool.query(
      "INSERT INTO VaultsCollections(vaultId, chainsConfigsId) VALUES ($1, $2);",
      [chainsConfigsId, vaultId],
    );

    return seedResult?.rows;
  } catch (error) {
    console.log(error);
  }
}

export async function insertVaultMetrics(
  is_seed: boolean,
  vault_id: Number,
  volume: Number,
  protocolFees: Number,
  apy: Number,
) {
  try {
    const result = await pool.query(
      "INSERT INTO VaultMetrics (vault_id, volume, protocolFees, apy) VALUES ($1, $2, $3, $4);",
      [vault_id, volume, protocolFees, apy],
    );

    return result.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function insertHistoricalAPY(
  vaultId: Number,
  apy: Number,
  apr: Number,
  time: any,
) {
  try {
    const result = await pool.query(
      "INSERT INTO HistoricalApy (vaultId, apy, apr, time ) VALUES ($1, $2, $3, $4);",
      [vaultId, apy, apr, time],
    );
  } catch (error) {
    console.log(error);
  }
}

export async function seedVault(vault: VaultSeedConfig): Promise<boolean> {
  try {
    const vaultId: Number | null = await insertVault(
      vault?.vaultName,
      vault?.vaultTicker,
      vault?.creatorId,
      vault?.chainsConfigsId,
    );

    if (vaultId !== null) {
    } else {
      throw new Error("Vault could not be inserted into our table ");
    }
    await insertVaultsCollection(vault?.chainsConfigsId, vault?.vaultId);
    await insertVaultMetrics(
      false,
      vault?.vaultId,
      vault?.volume,
      vault?.protocolFees,
      vault?.apy,
    );
    await insertTelosAgent(
      false,
      vault?.agentWalletAddress,
      vaultId,
      vault?.agentUserName,
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
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
