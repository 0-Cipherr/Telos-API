import {
  createWalletClient,
  http,
  type WalletClient,
  type WalletClientConfig,
} from "viem";
export async function getAllVaults() {
  try {
    const result = null;
  } catch (error) {
    console.log(error);

    return [];
  }
}

export async function getVault(id: number) {
  try {
  } catch (error) {
    console.log(error);
  }
}

class VaultExecutior {
  chains = [];

  async setChain(chain: WalletClientConfig) {}
  async setClient(account: any, cleint: any, chain: any) {
    const client: WalletClient = createWalletClient({
      account,
      chain,
      transport: http(),
    });
  }

  async getAllVaults() {}

  async getVault(id: number) {}
}
