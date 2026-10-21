import type { DeployNativeParams } from "../interfaces/OnchainInterface.js";
import { OnchainTool } from "./onchain-tools.js";

export class Registry {
  private viemAccount: any;
  private onChainTool: any;

  constructor() {}

  setViemAccount(newAccount: any) {
    this.viemAccount = newAccount;
    this.onChainTool = new OnchainTool();
  }

  async createVaultNative(owner: string, deployParams: DeployNativeParams) {
    try {
      const result = await this.onChainTool.write();
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async crossChainDeployQuote() {}
  async creatrVaultCrossChain() {}

  async deposit() {}

  async withdraw() {}
}

//idea have awwallet cal simple trnafer from n frontend or api to telos wallet api wallet wmanages funds
