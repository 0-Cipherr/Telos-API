import {
  createWalletClient,
  http,
  type WalletClient,
  type WalletClientConfig,
} from "viem";
import { getChainClients } from "../../viemClient..js";
import {
  getAllVaults,
  getDeploymentAbi,
  getDeploymentContract,
  getVaultById,
  insertVault,
} from "../db/vault-handler/vault-queries.js";
export class VaultExecutor {
  async setChain(chain: WalletClientConfig) {}
  async setClient(account: any, cleint: any, chain: any) {
    const client: WalletClient = createWalletClient({
      account,
      chain,
      transport: http(),
    });
  }

  async allVaults() {
    try {
      const vaults = await getAllVaults();

      return vaults || [];
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async vault(id: number) {
    try {
      const vault = await getVaultById(id);
      return vault || [null];
    } catch (error) {
      console.log(error);
      return [null];
    }
  }

  async deposit(chainId: Number, account: any, args: any[]) {
    try {
      const abi: any = await getDeploymentAbi();
      const executorAddress: string = await getDeploymentContract();
      await this.writeContract(chainId, executorAddress, abi, "deposit", args);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async withdraw(chainId: Number, account: any, args: any[]) {
    try {
      const abi: any = await getDeploymentAbi();
      const executorAddress: string = await getDeploymentContract();
      await this.writeContract(chainId, executorAddress, abi, "withdraw", args);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async addVault(vaultName: string, vaultChains: any[], creator: string) {
    try {
      await insertVault(vaultName, vaultChains, creator);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getShareBalance() {}

  async getVolume() {}

  async getDepositorInfo() {}

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
