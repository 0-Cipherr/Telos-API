import express from "express";
import BridgeQueries from "../db/bridge-handler/bridgeQueries.js";
import type { BridgeQueryRules } from "../interfaces/bridge-interfaces.js";
import { getAllVaults } from "../onchain-execution/VaultExecutor.js";

const vaultRouter = express.Router();
const bridgeQueries: BridgeQueryRules = new BridgeQueries();

//get all vaults available
vaultRouter.get("/all", async (req, res) => {
  try {
    const result = await getAllVaults();
  } catch (error) {
    console.log(error);
  }
});

//first thing to run before we test and use api
vaultRouter.post("/vault/:vaultInfo", (req: any, res: any) => {
  try {
    const { vaultInfo: any } = req;
    console.log("Running  ");
    res.status(200).send({ message: "Vault sccessfully added !" });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "unexpected error" });
  }
});

vaultRouter.post("/all", async (req, res) => {}); //get all vaults

vaultRouter.post("/:vaultId", async (req, res) => {}); //get by id
vaultRouter.post("/deposit/:vaultId/:depositParams", async (req, res) => {}); //get by id
vaultRouter.post("/withdraw/:vaultId/:withdrawParams", async (req, res) => {}); //get by id
