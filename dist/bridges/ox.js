const OX_BASE_URL = "https://api.0x.org/cross-chain";
function getApiKey() {
    const key = process.env.OX_API_KEY;
    if (!key)
        throw new Error("OX_API_KEY is not set");
    return key;
}
function normalizeStatus(value) {
    switch (value) {
        case "completed":
        case "in_progress":
        case "failed":
            return value;
        default:
            return "pending";
    }
}
export class OxBridge {
    name = "0x";
    async getQuotes(request) {
        const params = new URLSearchParams({
            originChain: String(request.originChain),
            destinationChain: String(request.destinationChain),
            sellToken: request.sellToken,
            buyToken: request.buyToken,
            sellAmount: request.sellAmount,
            originAddress: request.originAddress,
            sortQuotesBy: "price",
        });
        const response = await fetch(`${OX_BASE_URL}/quotes?${params.toString()}`, {
            headers: { "0x-api-key": getApiKey() },
        });
        if (!response.ok) {
            throw new Error(`0x quotes request failed: ${response.status} ${await response.text()}`);
        }
        const body = (await response.json());
        return (body.quotes ?? []).map((quote) => ({
            provider: this.name,
            quoteId: quote.quoteId,
            originChain: request.originChain,
            destinationChain: request.destinationChain,
            sellToken: request.sellToken,
            buyToken: request.buyToken,
            sellAmount: request.sellAmount,
            buyAmount: quote.buyAmount,
            transaction: {
                to: quote.transaction.details.to,
                data: quote.transaction.details.data,
                value: quote.transaction.details.value,
                gas: quote.transaction.details.gas ?? null,
            },
            allowanceSpender: quote.issues?.allowance?.spender ?? null,
        }));
    }
    async getStatus(request) {
        const params = new URLSearchParams({
            originChain: String(request.originChain),
            originTxHash: request.originTxHash,
        });
        if (request.quoteId)
            params.set("quoteId", request.quoteId);
        const response = await fetch(`${OX_BASE_URL}/status?${params.toString()}`, {
            headers: { "0x-api-key": getApiKey() },
        });
        if (!response.ok) {
            throw new Error(`0x status request failed: ${response.status} ${await response.text()}`);
        }
        const raw = (await response.json());
        return { provider: this.name, status: normalizeStatus(raw.status), raw };
    }
}
//# sourceMappingURL=ox.js.map