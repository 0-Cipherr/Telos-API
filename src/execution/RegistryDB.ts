import {
  createWalletClient,
  http,
  type WalletClient,
  type WalletClientConfig,
} from "viem";
import { getChainClients } from "../../viemClient..js";
import {
  getAllVaults,
  getDeploymentContract,
  getVaultByChain,
  getVaultById,
  getVaultByName,
  insertVault,
} from "../db/vault-handler/vault-queries.js";
import type { address } from "../types/OnchainTypes.js";
export class RegistryDB {
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

  async vaultByName(name: string) {
    try {
      const vault = await getVaultByName(name);
      return vault || [];
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async inserVault(
    vaultName: string,
    vaultTicker: string,
    vaultChains: any[],
    creator: string,
    addresses: string[],
  ) {
    try {
      const result: any = await insertVault(
        vaultName,
        vaultTicker,
        vaultChains,
        creator,
        addresses,
      );
      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async vaultByChain(chainId: Number) {
    try {
      const vault = await getVaultByChain(chainId);
      return vault || [];
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async vault(id: number) {
    try {
      const vault = await getVaultById(id);
      return vault || [];
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async metricsRefresh(id: Number) {
    try {
      return [];
    } catch (error) {
      console.log(error);
      return [];
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

  async deployNative(chainId: Number, account: any, args: any[]) {
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

  async deployCrossChain(chainId: Number, account: any, args: any[]) {
    try {
      const abi: any = [];
      const executorAddress: string = await getDeploymentContract();
      await this.writeContract(chainId, executorAddress, abi, "withdraw", args);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async addVault(
    vaultName: string,
    vaultTicker: string,
    vaultChains: any[],
    creator: address,
    deployedAddresses: address[],
  ) {
    try {
      await insertVault(
        vaultName,
        vaultTicker,
        vaultChains,
        creator,
        deployedAddresses,
      );
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
