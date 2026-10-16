import pool from "../pool.js";

async function insertDeployments(chaindId: Number, deployment: any[]) {
  try {
    await pool.connect();
    const result = await pool.query(
      `INSET INTO Deployments (contractType,contractAddress,abi) values ($1, $2, $3, $4)`,
      deployment,
    );

    await pool.query(
      "INSERT INTO DeploymentsManager (chainId, deploymentRef) values ($1, $2)",
      [chaindId, result.rows[0].id],
    );

    return true;
  } catch (error) {
    console.log(error);

    return false;
  }
}

async function getDeployments() {
  try {
    await pool.connect();
    const result = await pool.query(`SELECT * FROM Deployments;`);
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

module.exports = { insertDeployments, getDeployments };
