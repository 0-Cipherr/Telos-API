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

export async function getDeploymentAbi() {
  try {
    const results = await getDeployments();
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

export async function insertVault(
  vaultName: string,
  vaultTicker: string,
  vaultChains: any[],
  creator: string,
  addresses: string[],
) {
  try {
    await pool.connect();
    const results = await pool.query(
      "INSERT INTO Vaults (vaultName,vaultTicker,,aultChains, creator. addresses), VALUES ($1, $2, $3. $4, $5)",
      [vaultName, vaultTicker, vaultChains, creator, addresses],
    );
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}
