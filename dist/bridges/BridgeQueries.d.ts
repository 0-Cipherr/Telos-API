import type { BridgeQuote, BridgeStatusValue } from "./BridgeProvider.js";
export type BridgeTransferRow = {
    id: number;
    provider: string;
    quote_id: string | null;
    origin_chain: number;
    origin_tx_hash: string;
    status: BridgeStatusValue;
    created_at: Date;
    updated_at: Date;
};
export declare class BridgeQueries {
    saveQuotes(quotes: BridgeQuote[]): Promise<void>;
    getQuoteById(quoteId: string): Promise<BridgeQuote | null>;
    upsertTransfer(input: {
        provider: string;
        quoteId: string | null;
        originChain: number;
        originTxHash: string;
        status: BridgeStatusValue;
    }): Promise<BridgeTransferRow>;
    getTransferByTxHash(originTxHash: string): Promise<BridgeTransferRow | null>;
}
export default BridgeQueries;
//# sourceMappingURL=BridgeQueries.d.ts.map