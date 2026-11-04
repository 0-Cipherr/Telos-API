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


export async function insertTelosAgent(is_seed:boolean, walletAddress: String as `0x${String}`, agentUserName:String, agentWalletAddress:String as `0x${String}`){
  try {
    const result = await pool.query(`
    INSERT INTO TelosAgent (id, walletAddress, agentUserName, agentWalletAddress) VALUES ($1, $2, $3, $4);
    `, [walletAddress, agentUserName, agentWalletAddress]);
  return result.rows || [];
  } catch (error){
    console.log(error)
    return [];
  }
}

export async function insertVaultsCollection(chainsConfigsId:Number, vaultId:Number){
  try {
    const seedResult = await pool.query(`
    INSERT INTO VaultsCollections(vaultId, chainsConfigsId) VALUES ($1, $2);
    `, [chainsConfigId, vaultId]);
    
    return seedResult?.rows;
  } catch (error) {
    console.log(error);
  }
}

export async function insertVaultMetrics(is_seed:boolean, vault_id:Number, volume:Number, protocolFees:Number, apy:Number){
  try {
    const result  =await pool.query(`
     INSERT INTO VaultMetrics (vault_id, volume, protocolFees, apy) VALUES ($1, $2, $3, $4);
    `, [vault_id, volume, protocolFees, apy]);

    return result.rows || [];
  } catch (error){
    console.log(error)
    return [];
  }
}

export async function seedVault(vault:any){
  try {
    await insertVaultsCollection(vault?.chainsConfigId, vault?.vaultId);
    await insertVaultMetrics(false, vault?.vaultId, vault?.volume, vault?.protocolFees, vault?.apy);
    await insertTelosAgent(false, vault?.agentWalletAddress, vault?.agentUserName, vault?.agentAddress)
    return true; 
  } catch (error){
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
