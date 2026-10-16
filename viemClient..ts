import { createPublicClient, http } from "viem";
import { arbitrumSepolia, baseSepolia, sepolia } from "viem/chains";

export const sepoliaClient: any = createPublicClient({
  batch: {
    multicall: true,
  },
  chain: sepolia,
  transport: http(),
}); //marked as any in fucntion

export const baseSepoliaClient: any = createPublicClient({
  batch: {
    multicall: true,
  },
  chain: baseSepolia,
  transport: http(),
}); //marked as any in fucntion
export const arbitrumSepoliaClient: any = createPublicClient({
  batch: {
    multicall: true,
  },
  chain: arbitrumSepolia,
  transport: http(),
}); //marked as any in fucntion

export async function getChainClients() {
  const sepoliaChainId = await sepoliaClient.getChainId();
  const baseSepoliaChainId = await baseSepoliaClient.getChainId();
  const arbitrumSepoliaChainId = await arbitrumSepoliaClient.getChainId();
  return {
    sepoliaChainId: sepoliaClient,
    baseSepoliaChainId: baseSepoliaClient,
    arbitrumSepoliaChainId: arbitrumSepoliaClient,
  };
}

//gve the following below a look very important
//https://viem.sh/docs/clients/public
//allows u to scheduel reads i think
//   batch: {
//     multicall: true,
//   },

//transport : A Transport is the intermediary layer that is responsible for executing outgoing requests (ie. RPC requests) in viem.
