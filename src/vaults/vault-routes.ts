import express from "express";
import BridgeQueries from "../db/bridge-handler/bridgeQueries.js";
import { VaultExecutor } from "../execution/VaultExecutor.js";
import type { BridgeQueryRules } from "../interfaces/bridge-interfaces.js";

const vaultRouter = express.Router();
const bridgeQueries: BridgeQueryRules = new BridgeQueries();
const vaultExecutor = new VaultExecutor();
//get all vaults available
vaultRouter.get("/all", async (req, res) => {
  try {
    const result = await vaultExecutor.allVaults();
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "unexpected error" });
  }
});

//first thing to run before we test and use api
vaultRouter.get("/vault/:vaultId", async (req: any, res: any) => {
  try {
    const result = await vaultExecutor.vault(req.params.vaultId);
    console.log("Running ");
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "unexpected error" });
  }
});

vaultRouter.post("/deposit/:vaultId/:depositParams", async (req, res) => {}); //get by id
vaultRouter.post("/withdraw/:vaultId/:withdrawParams", async (req, res) => {}); //get by id
