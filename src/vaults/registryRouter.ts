import express from "express";
import BridgeQueries from "../db/bridge-handler/bridgeQueries.js";
import {
  getAllDepositors,
  getAllStrategies,
  getAllVaults,
  getDepositorsById,
  getVaultByChain,
  getVaultByChainId,
  getVaultById,
  getVaultByName,
  getVaultByTicker,
  insertDepositors,
  insertStrategy,
  insertVault,
} from "../db/vault-handler/vault-queries.js";
import { RegistryDB } from "../execution/RegistryDB.js";
import type { BridgeQueryRules } from "../interfaces/bridge-interfaces.js";
import { Registry } from "../onchain/onchain-executor.js";
import type { address } from "../types/OnchainTypes.js";

export const registryRouter = express.Router();
const bridgeQueries: BridgeQueryRules = new BridgeQueries();
const vaultsRegistryDB = new RegistryDB();
const _registryAdrrress: address = "0x";
const _messengerAddress: address = "0x";
const _factoryAddress: address = "0x";
const registry = new Registry(
  _registryAdrrress,
  _messengerAddress,
  _factoryAddress,
);

registryRouter.post("/add/vault", async (req, res) => {
  try {
    if (req.body) {
      const { vault }: any = req.body;
      if (vault) {
        const result = await insertVault(
          vault[0],
          vault[1],
          vault[2],
          vault[3],
          vault[4],
        );
        res.status(200).send({ message: "Vault Created!" });
      }
    } else {
      res.status(500).send({ message: "Body not formatted properly!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "unexpected error" });
  }
});

//get all vaults available
registryRouter.get("/all", async (req, res) => {
  try {
    const result = await getAllVaults();
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "unexpected error" });
  }
});

registryRouter.get("/:vaultId", async (req: any, res: any) => {
  try {
    const result = await getVaultById(req.params.vaultId);
    console.log("Running ");
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "unexpected error" });
  }
});

registryRouter.get("/:vaultTicker", async (req: any, res: any) => {
  try {
    vaultsRegistryDB;
    const result = await getVaultByTicker(req.params.vaultTicker);
    console.log("Running ");
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "unexpected error" });
  }
});

registryRouter.get("/:vaultName", async (req: any, res: any) => {
  try {
    const result = await getVaultByName(req.params.vaultName);
    console.log("Running ");
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "unexpected error" });
  }
});

registryRouter.get("/:chainIdPrimary", async (req: any, res: any) => {
  try {
    const result = await getVaultByChainId(Number(req.params.chainIdPrimary));
    console.log("Running ");
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "unexpected error" });
  }
});

registryRouter.get("/:creatorId", async (req: any, res: any) => {
  try {
    const result = await getVaultByChain(Number(req.params.creatorId));
    console.log("Running ");
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "unexpected error" });
  }
});

//first thing to run before we test and use api

//createVault
registryRouter.get("/agent", async (req: any, res: any) => {
  try {
    const { vaultName, vaultTicker, vaultChains, creator, addresses } =
      req.body;
    const result = await vaultsRegistryDB.inserVault(
      vaultName,
      vaultTicker,
      vaultChains,
      creator,
      addresses,
    );
    res.status(200).send({ message: "Vault successfully created!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "unexpected error" });
  }
});
//createVault
registryRouter.get("/create/native/prepare", async (req: any, res: any) => {
  try {
    const { vaultName, vaultTicker, vaultChains, creator, addresses } =
      req.body;
    const result = await vaultsRegistryDB.inserVault(
      vaultName,
      vaultTicker,
      vaultChains,
      creator,
      addresses,
    );
    res.status(200).send({ message: "Vault successfully created!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "unexpected error" });
  }
});
registryRouter.post("/create/native", async (req: any, res: any) => {
  try {
    const { vaultName, vaultTicker, vaultChains, creator, addresses } =
      req.body;
    const result = await vaultsRegistryDB.inserVault(
      vaultName,
      vaultTicker,
      vaultChains,
      creator,
      addresses,
    );
    res.status(200).send({ message: "Vault successfully created!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "unexpected error" });
  }
});

registryRouter.get("/depositors", async (req: any, res: any) => {
  try {
    const result = await getAllDepositors();
    res.status(200).send({ message: "Vault successfully created!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "unexpected error" });
  }
});
registryRouter.get("/depositors/:creatorId", async (req: any, res: any) => {
  try {
    const { creatorId } = req.body;
    const result = await getDepositorsById(creatorId);
    res.status(200).send({ message: "Vault successfully created!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "unexpected error" });
  }
});
registryRouter.get("/depositors/:creatorId", async (req: any, res: any) => {
  try {
    const { creatorId } = req.body;
    const result = await getDepositorsById(creatorId);
    res.status(200).send({ message: "Vault successfully created!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "unexpected error" });
  }
});
registryRouter.get("/startegy/all", async (req: any, res: any) => {
  try {
    const { creatorId } = req.body;
    const result = await getAllStrategies();
    res.status(200).send({ message: "Vault successfully created!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "unexpected error" });
  }
});
registryRouter.post("/depositors/:creatorId", async (req: any, res: any) => {
  try {
    const { creatorId, vaultId } = req.body;
    const result = await insertDepositors(creatorId, vaultId);
    res.status(200).send({ message: "Vault successfully created!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "unexpected error" });
  }
});
registryRouter.post("/strategy/:startegy", async (req: any, res: any) => {
  try {
    const {
      name,
      protocol,
      chainId,
      contractAddress,
      creatorAddress,
      configuration,
    }: any = req.body;
    const result = await insertStrategy(
      name,
      protocol,
      chainId,
      contractAddress,
      creatorAddress,
      configuration,
    );
    res.status(200).send({ message: "Vault successfully created!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "unexpected error" });
  }
});
//only admin access

//updates metrics
registryRouter.put("/metrics/update/:vaultId", async (req: any, res: any) => {
  try {
    const metrics = await vaultsRegistryDB.metricsRefresh(req.params.vaultId);
    console.log("Running ");
    res.status(200).send({ metrics });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "unexpected error" });
  }
});
