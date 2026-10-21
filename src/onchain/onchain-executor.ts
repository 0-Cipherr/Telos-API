import type { DeployNativeParams } from "../interfaces/OnchainInterface.js";
import type { address } from "../types/OnchainTypes.js";
import { OnchainTool } from "./onchain-tools.js";

export class Registry {
  private viemAccount: any;
  private onChainTool: any;
  private registryAddress: address;
  private messengerAddress: address;
  private factoryAddress: address;

  constructor(
    _registryAdrrress: address,
    _messengerAddress: address,
    _factoryAddress: address,
  ) {
    this.registryAddress = _registryAdrrress;
    this.messengerAddress = _messengerAddress;
    this.factoryAddress = _factoryAddress;
  }

  setViemAccount(newAccount: any) {
    this.viemAccount = newAccount;
    this.onChainTool = new OnchainTool();
  }

  async createVaultNative(owner: address, deployParams: DeployNativeParams) {
    try {
      const result = await this.onChainTool.write(
        this.onChainTool.constructWriteCallParams(
          this.registryAddress,
          "deployHubVault",
          [owner, deployParams],
        ),
      );

      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async crossChainDeployQuote() {}
  async creatrVaultCrossChain() {}

  async deposit() {}

  async withdraw() {}
}

//idea have awwallet cal simple trnafer from n frontend or api to telos wallet api wallet wmanages funds
