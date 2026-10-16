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

export async function insertVault(
  vaultName: string,
  vaultChains: any[],
  creator: string,
) {
  try {
    await pool.connect();
    const results = await pool.query(
      "INSERT INTO Vaults (vaultName, vaultChains, creator), VALUES ($1, $2, $2)",
      [vaultName, vaultChains, creator],
    );
    return results.rows || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}
