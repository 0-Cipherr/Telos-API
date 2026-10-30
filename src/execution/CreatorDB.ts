import {
  createWalletClient,
  http,
  type WalletClient,
  type WalletClientConfig,
} from "viem";
import {
  getAllCreators,
  getCreatorByAddress,
  getCreatorById,
  insertCreator,
} from "../db/vault-handler/vault-queries.js";
import type { address } from "../types/OnchainTypes.js";
export class CreatorDB {
  async setChain(chain: WalletClientConfig) {}
  async setClient(account: any, cleint: any, chain: any) {
    const client: WalletClient = createWalletClient({
      account,
      chain,
      transport: http(),
    });
  }
  async all() {
    try {
      const creator = await getAllCreators();

      return creator || [];
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async uploadCreator(creatorAddress: address) {
    try {
      const creator = await insertCreator(creatorAddress);

      return creator || [];
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async creatorById(id: number) {
    try {
      const creator = await getCreatorById(id);

      return creator || [];
    } catch (error) {
      console.log(error);
      return [];
    }
  }
  async creatorByAddress(creatorAddress: address) {
    try {
      const creator = await getCreatorByAddress(creatorAddress);

      return creator || [];
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}
