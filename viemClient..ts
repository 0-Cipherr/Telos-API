import { createPublicClient, http } from "viem";
import { arbitrumSepolia, baseSepolia, mainnet } from "viem/chains";

export const mainnetClient: any = createPublicClient({
  batch: {
    multicall: true,
  },
  chain: mainnet,
  transport: http(),
}); //marked as any in fucntion

export const baseSepoliaCLient: any = createPublicClient({
  batch: {
    multicall: true,
  },
  chain: baseSepolia,
  transport: http(),
}); //marked as any in fucntion
export const arbitrumSepoliaCLient: any = createPublicClient({
  batch: {
    multicall: true,
  },
  chain: arbitrumSepolia,
  transport: http(),
}); //marked as any in fucntion

//gve the following below a look very important
//https://viem.sh/docs/clients/public
//allows u to scheduel reads i think
//   batch: {
//     multicall: true,
//   },

//transport : A Transport is the intermediary layer that is responsible for executing outgoing requests (ie. RPC requests) in viem.
