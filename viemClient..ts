import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const client: any = createPublicClient({
  chain: mainnet,
  transport: http(),
}); //marked as any in fucntion

module.exports = { client };
