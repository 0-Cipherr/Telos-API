import type { BridgeProvider, BridgeQuote, BridgeQuoteRequest, BridgeStatus, BridgeStatusRequest } from "./BridgeProvider.js";
export declare class OxBridge implements BridgeProvider {
    readonly name = "0x";
    getQuotes(request: BridgeQuoteRequest): Promise<BridgeQuote[]>;
    getStatus(request: BridgeStatusRequest): Promise<BridgeStatus>;
}
//# sourceMappingURL=ox.d.ts.map