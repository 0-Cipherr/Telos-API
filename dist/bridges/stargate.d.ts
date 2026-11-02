import type { BridgeProvider, BridgeQuote, BridgeQuoteRequest, BridgeStatus, BridgeStatusRequest } from "./BridgeProvider.js";
export declare class StargateBridge implements BridgeProvider {
    readonly name = "stargate";
    getQuotes(request: BridgeQuoteRequest): Promise<BridgeQuote[]>;
    getStatus(request: BridgeStatusRequest): Promise<BridgeStatus>;
}
//# sourceMappingURL=stargate.d.ts.map