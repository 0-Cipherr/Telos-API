import express from "express";
import BridgeQueries from "../db/bridge-handler/bridgeQueries.js";
import type { BridgeQueryRules } from "../interfaces/bridge-interfaces.js";
import { Registry } from "../onchain/onchain-executor.js";
import type { address } from "../types/OnchainTypes.js";

export const creatorRouter = express.Router();
const bridgeQueries: BridgeQueryRules = new BridgeQueries();
const creatorDB = new CreatorDB();
const _registryAdrrress: address = "0x";
const _messengerAddress: address = "0x";
const _factoryAddress: address = "0x";
const registry = new Registry(
  _registryAdrrress,
  _messengerAddress,
  _factoryAddress,
);

registryRouter.get("/all", async (req, res) => {
  try {
    const result = await vaultsRegistryDB.all();
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "unexpected error" });
  }
});
