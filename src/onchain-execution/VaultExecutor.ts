import {
  createWalletClient,
  http,
  type WalletClient,
  type WalletClientConfig,
} from "viem";
import { getChainClients } from "../../viemClient..js";
import { telos } from "../Telos-AddressBook.js";

class VaultExecutor {
  currentChain: Number = 0;

  VaultExecutor(chain: Number) {
    this.currentChain = chain;
  }

  async setChain(chain: WalletClientConfig) {}
  async setClient(account: any, cleint: any, chain: any) {
    const client: WalletClient = createWalletClient({
      account,
      chain,
      transport: http(),
    });
  }

  async getAllVaults(chainId: any) {
    try {
      let vaults: any[] = [];
      const currentId = await this.readContract(
        chainId,
        telos[chainId].registry,
        [],
        "currentVaultId",
        [],
      );

      for (let i = 0; i < currentId; i++) {
        const vault = await this.getVault(i, chainId);
        vaults.push(vault);
      }
      return vaults;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getVault(id: number, chainId: any) {
    try {
      const vault = await this.readContract(
        chainId,
        telos[chainId].registry,
        [],
        "getVault",
        [id],
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async readContract(
    chainId: Number,
    address: string,
    abi: any,
    functionName: string,
    args: any[],
  ) {
    try {
      const client: any = await this.getClient(chainId);
      if (client !== null) {
        const result = await client.readContract({
          address,
          abi,
          functionName,
          args,
        });

        return result;
      }
      return null;
      // const result = await publicClient;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getClient(chainId: Number) {
    try {
      const clients: any = await getChainClients();
      let clientFound = null;
      for (const client in clients) {
        if (clients[client].getChainId() == chainId) {
          clientFound = clients[client];
        }
      }

      return clientFound;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async simulateContract(
    chainId: Number,
    address: string,
    abi: any,
    functionName: string,
    args: any[],
  ) {
    try {
      const client: any = await this.getClient(chainId);
      if (client !== null) {
        const result = await client.simulateContract({
          address,
          abi,
          functionName,
          args,
        });
        this.writeContract(chainId, address, abi, functionName, args);
      }
      // const result = await publicClient;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async writeContract(
    chainId: Number,
    address: string,
    abi: any,
    functionName: string,
    args: any[],
  ) {
    try {
      const client: any = await this.getClient(chainId);
      if (client !== null) {
        const result = await client.writeContract({
          address,
          abi: null,
          functionName,
          args,
        });

        return result;
      }
      return null;
      // const result = await publicClient;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
module.exports = { VaultExecutor };
