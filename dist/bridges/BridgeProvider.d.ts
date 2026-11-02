export type BridgeQuoteRequest = {
    originChain: number;
    destinationChain: number;
    sellToken: string;
    buyToken: string;
    sellAmount: string;
    originAddress: string;
    vaultAddress: string;
    recipient: string;
};
export type BridgeTransaction = {
    to: string;
    data: string;
    value: string;
    gas: string | null;
};
export type BridgeQuote = {
    provider: string;
    quoteId: string;
    originChain: number;
    destinationChain: number;
    sellToken: string;
    buyToken: string;
    sellAmount: string;
    buyAmount: string;
    transaction: BridgeTransaction;
    allowanceSpender: string | null;
};
export type BridgeStatusValue = "pending" | "in_progress" | "completed" | "failed";
export type BridgeStatusRequest = {
    originChain: number;
    originTxHash: string;
    quoteId?: string;
};
export type BridgeStatus = {
    provider: string;
    status: BridgeStatusValue;
    raw: unknown;
};
export interface BridgeProvider {
    readonly name: string;
    getQuotes(request: BridgeQuoteRequest): Promise<BridgeQuote[]>;
    getStatus(request: BridgeStatusRequest): Promise<BridgeStatus>;
}
//# sourceMappingURL=BridgeProvider.d.ts.map