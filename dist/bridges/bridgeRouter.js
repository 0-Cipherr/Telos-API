import express from "express";
import { BridgeQueries } from "./BridgeQueries.js";
import { StargateBridge } from "./stargate.js";
export const bridgeRouter = express.Router();
const queries = new BridgeQueries();
const providers = {
    stargate: new StargateBridge(),
};
const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const TX_HASH = /^0x[a-fA-F0-9]{64}$/;
const CHAIN_ID = /^[1-9][0-9]{0,9}$/;
const AMOUNT_WEI = /^[1-9][0-9]{0,77}$/;
// Quote a native ETH bridge out of a vault. The response includes a
// ready-to-sign bridgeOut transaction for the vault's operator (creator or agent).
bridgeRouter.get("/quote", async (req, res) => {
    const provider = providers[String(req.query.provider || "stargate")];
    if (!provider) {
        res.status(400).json({ error: "unknown provider" });
        return;
    }
    const originChain = String(req.query.originChain || "");
    const destinationChain = String(req.query.destinationChain || "");
    const amount = String(req.query.amount || "");
    const vaultAddress = String(req.query.vaultAddress || "");
    const recipient = String(req.query.recipient || "");
    if (!CHAIN_ID.test(originChain) || !CHAIN_ID.test(destinationChain)) {
        res.status(400).json({ error: "originChain and destinationChain must be chain IDs" });
        return;
    }
    if (!AMOUNT_WEI.test(amount)) {
        res.status(400).json({ error: "amount must be a positive integer in wei" });
        return;
    }
    if (!ADDRESS.test(vaultAddress) || !ADDRESS.test(recipient)) {
        res.status(400).json({ error: "vaultAddress and recipient must be 0x addresses" });
        return;
    }
    const request = {
        originChain: Number(originChain),
        destinationChain: Number(destinationChain),
        sellToken: "ETH",
        buyToken: "ETH",
        sellAmount: amount,
        originAddress: vaultAddress,
        vaultAddress,
        recipient,
    };
    try {
        const quotes = await provider.getQuotes(request);
        await queries.saveQuotes(quotes);
        res.json({ quotes });
    }
    catch (error) {
        console.error("[bridges/quote]", error);
        res.status(502).json({ error: error.message });
    }
});
// Track an origin transaction's status with the provider and record it.
bridgeRouter.get("/status", async (req, res) => {
    const provider = providers[String(req.query.provider || "stargate")];
    if (!provider) {
        res.status(400).json({ error: "unknown provider" });
        return;
    }
    const originChain = String(req.query.originChain || "");
    const originTxHash = String(req.query.originTxHash || "");
    if (!CHAIN_ID.test(originChain)) {
        res.status(400).json({ error: "originChain must be a chain ID" });
        return;
    }
    if (!TX_HASH.test(originTxHash)) {
        res.status(400).json({ error: "originTxHash must be a 32-byte hash" });
        return;
    }
    try {
        const status = await provider.getStatus({
            originChain: Number(originChain),
            originTxHash,
        });
        const transfer = await queries.upsertTransfer({
            provider: status.provider,
            quoteId: null,
            originChain: Number(originChain),
            originTxHash,
            status: status.status,
        });
        res.json({ status: status.status, transfer });
    }
    catch (error) {
        console.error("[bridges/status]", error);
        res.status(502).json({ error: error.message });
    }
});
//# sourceMappingURL=bridgeRouter.js.map