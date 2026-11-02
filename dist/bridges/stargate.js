import { createPublicClient, encodeFunctionData, http, keccak256, parseAbi, toHex, } from "viem";
import { abstract, arbitrum, base, hemi, linea, mainnet, manta, optimism, scroll, soneium, unichain, } from "viem/chains";
const NATIVE_ETH = "0x0000000000000000000000000000000000000000";
const LAYERZERO_SCAN_URL = "https://scan.layerzero-api.com/v1/messages/tx";
// Chains with a Stargate V2 native ETH pool. Endpoint IDs come from the
// LayerZero metadata API (V2 deployments).
const NATIVE_CHAINS = [
    { chainId: 1, eid: 30101, viemChain: mainnet },
    { chainId: 10, eid: 30111, viemChain: optimism },
    { chainId: 130, eid: 30320, viemChain: unichain },
    { chainId: 169, eid: 30217, viemChain: manta },
    { chainId: 1868, eid: 30340, viemChain: soneium },
    { chainId: 2741, eid: 30324, viemChain: abstract },
    { chainId: 8453, eid: 30184, viemChain: base },
    { chainId: 42161, eid: 30110, viemChain: arbitrum },
    { chainId: 43111, eid: 30329, viemChain: hemi },
    { chainId: 59144, eid: 30183, viemChain: linea },
    { chainId: 534352, eid: 30214, viemChain: scroll },
    { chainId: 97477, eid: 30393 },
];
const telosVaultAbi = parseAbi([
    "function quoteBridgeOut(uint32 dstEid, address to, uint256 amount) view returns (uint256 nativeFee, uint256 amountReceived)",
    "function bridgeOut(uint32 dstEid, address to, uint256 amount, uint256 minAmountReceived) payable returns (bytes32 guid)",
]);
function findChain(chainId) {
    const chain = NATIVE_CHAINS.find((entry) => entry.chainId === chainId);
    if (!chain)
        throw new Error(`Chain ${chainId} has no Stargate native ETH pool`);
    return chain;
}
function isNativeEth(token) {
    const normalized = token.toLowerCase();
    return normalized === NATIVE_ETH || normalized === "eth";
}
function rpcUrlFor(chain) {
    const override = process.env[`RPC_URL_${chain.chainId}`];
    if (override)
        return override;
    const fallback = chain.viemChain?.rpcUrls.default.http[0];
    if (!fallback)
        throw new Error(`Set RPC_URL_${chain.chainId} for chain ${chain.chainId}`);
    return fallback;
}
function normalizeStatus(value) {
    switch (value) {
        case "DELIVERED":
            return "completed";
        case "FAILED":
            return "failed";
        case "INFLIGHT":
        case "CONFIRMING":
        case "VERIFYING":
        case "VERIFIED":
            return "in_progress";
        default:
            return "pending";
    }
}
export class StargateBridge {
    name = "stargate";
    async getQuotes(request) {
        if (!isNativeEth(request.sellToken) || !isNativeEth(request.buyToken)) {
            throw new Error("Stargate native pools only bridge ETH");
        }
        if (request.originChain === request.destinationChain) {
            throw new Error("Origin and destination chains must differ");
        }
        const origin = findChain(request.originChain);
        const destination = findChain(request.destinationChain);
        const vault = request.vaultAddress;
        const recipient = request.recipient;
        const amount = BigInt(request.sellAmount);
        const client = createPublicClient({ transport: http(rpcUrlFor(origin)) });
        const [nativeFee, amountReceived] = await client.readContract({
            address: vault,
            abi: telosVaultAbi,
            functionName: "quoteBridgeOut",
            args: [destination.eid, recipient, amount],
        });
        const data = encodeFunctionData({
            abi: telosVaultAbi,
            functionName: "bridgeOut",
            args: [destination.eid, recipient, amount, amountReceived],
        });
        const quoteId = keccak256(toHex(JSON.stringify([
            this.name,
            request.originChain,
            request.destinationChain,
            vault.toLowerCase(),
            recipient.toLowerCase(),
            request.sellAmount,
            Date.now(),
        ])));
        return [
            {
                provider: this.name,
                quoteId,
                originChain: request.originChain,
                destinationChain: request.destinationChain,
                sellToken: NATIVE_ETH,
                buyToken: NATIVE_ETH,
                sellAmount: amount.toString(),
                buyAmount: amountReceived.toString(),
                transaction: {
                    to: vault,
                    data,
                    value: nativeFee.toString(),
                    gas: null,
                },
                allowanceSpender: null,
            },
        ];
    }
    async getStatus(request) {
        const response = await fetch(`${LAYERZERO_SCAN_URL}/${request.originTxHash}`);
        if (!response.ok) {
            throw new Error(`LayerZero Scan status request failed: ${response.status} ${await response.text()}`);
        }
        const raw = (await response.json());
        const status = normalizeStatus(raw.data?.[0]?.status?.name);
        return { provider: this.name, status, raw };
    }
}
//# sourceMappingURL=stargate.js.map