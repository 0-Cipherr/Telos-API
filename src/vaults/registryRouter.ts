import express from "express";
import BridgeQueries from "../db/bridge-handler/bridgeQueries.js";
import { RegistryDB } from "../execution/RegistryDB.js";
import type { BridgeQueryRules } from "../interfaces/bridge-interfaces.js";
import type { DeployNativeParams } from "../interfaces/OnchainInterface.js";
import { encodeValues } from "../onchain/onchain-data-hanler.js";
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

//get all vaults available
registryRouter.get("/all", async (req, res) => {
  try {
    const result = await vaultsRegistryDB.allVaults();
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "unexpected error" });
  }
});

registryRouter.post("/add", async (req, res) => {
  try {
    const result = await vaultsRegistryDB.addVault(
      req.body.vaultInfo.vaultName,
      req.body.vaultInfo.vaultChains,
      req.body.creator,
    );
    res.status(200).send({ message: "Vault Created!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "unexpected error" });
  }
});

//first thing to run before we test and use api
registryRouter.get("/vault/:vaultId", async (req: any, res: any) => {
  try {
    const result = await vaultsRegistryDB.vault(req.params.vaultId);
    console.log("Running ");
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "unexpected error" });
  }
});

registryRouter.get("/vault/:vaultName", async (req: any, res: any) => {
  try {
    const result = await vaultsRegistryDB.vaultByName(req.params.vaultName);
    console.log("Running ");
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "unexpected error" });
  }
});

registryRouter.get("/vault/:chainId", async (req: any, res: any) => {
  try {
    const result = await vaultsRegistryDB.vaultByChain(
      Number(req.params.chainId),
    );
    console.log("Running ");
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "unexpected error" });
  }
});

//onchain vault qyite
registryRouter.put(
  "/vault/deposit/native/quote",
  async (req: any, res: any) => {
    try {
      const registry: any = new Registry(
        _registryAdrrress,
        _messengerAddress,
        _factoryAddress,
      );
      const { account, quoteParams }: any = req.body; //vem config for user

      const { owner, deployParams }: any = quoteParams;
      const deployNativeParams: DeployNativeParams = {
        owner,
        _deployParams: encodeValues(deployParams),
      };

      await registry.setViemAccount();
      const quote: any = await registry.createVaultNative(owner, deployParams);
      res.status(200).send({ message: "" });
    } catch (error) {
      console.log(error);

      res.status(500).send({ message: "unexpected error" });
    }
  },
);

//createVault
registryRouter.post("/vault/create/native", async (req: any, res: any) => {
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

//only admin access

//updates metrics
registryRouter.put(
  "/vault/metrics/update/:vaultId",
  async (req: any, res: any) => {
    try {
      const metrics = await vaultsRegistry.metricsRefresh(req.params.vaultId);
      console.log("Running ");
      res.status(200).send({ metrics });
    } catch (error) {
      console.log(error);

      res.status(500).send({ message: "unexpected error" });
    }
  },
);

registryRouter.post("/deposit/:vaultId", async (req, res) => {}); //get by id
registryRouter.post(
  "/withdraw/:vaultId/:withdrawParams",
  async (req, res) => {},
); //get by id
