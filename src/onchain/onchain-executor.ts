import { getAbiByAddress } from "../db/vault-handler/vault-queries.js";
import type { DeployNativeParams } from "../interfaces/OnchainInterface.js";
import type { address } from "../types/OnchainTypes.js";
import { OnchainTool } from "./onchain-tools.js";

export class Registry {
  private viemAccount: any;
  private onChainTool: any;
  private registryAddress: address;
  private messengerAddress: address;
  private factoryAddress: address;
  private ABI: any;

  constructor(
    _registryAdrrress: address,
    _messengerAddress: address,
    _factoryAddress: address,
  ) {
    this.registryAddress = _registryAdrrress;
    this.messengerAddress = _messengerAddress;
    this.factoryAddress = _factoryAddress;
    this.ABI = []; //did this so compiller shuts up
    this.setup();
  }

  setup() {
    try {
      const update = async () => {
        const _ABI = await this.getRegistryABI(this.registryAddress);
        this.ABI = _ABI;
      };
      // `update` is async: without this catch a database hiccup becomes an
      // unhandled rejection and takes the whole API (including /api/chat) down.
      void update().catch((error) => {
        console.log(error);
        this.ABI = [];
      });
    } catch (error) {
      console.log(error);
      this.ABI = [];
    }
  }

  setViemAccount(newAccount: any) {
    this.viemAccount = newAccount;
  }

  instantiateOnchainTool() {
    this.onChainTool = new OnchainTool();
  }

  private async getRegistryABI(contractAddress: address) {
    try {
      const _ABI: any = await getAbiByAddress(contractAddress);
      const _ABICLone: any = _ABI;
      return _ABICLone[0];
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async createVaultNative(owner: address, deployParams: DeployNativeParams) {
    try {
      const result = await this.onChainTool.write(
        this.onChainTool.constructWriteCallParams(
          this.registryAddress,
          "deployHubVault",
          [owner, deployParams],
          [], //abi of contract that executes the deposit
          0, //value of assets amount of assts for vault
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
