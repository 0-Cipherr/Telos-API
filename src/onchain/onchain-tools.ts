import type { address } from "../types/OnchainTypes.js";

export class OnchainTool {
  private viemConfig: any;

  setViemConfig() {}
  constructWriteCallParams(
    account: any,
    contractAddress: address,
    functionName: string,
    args: any[],
    abi: any[],
    value: any,
  ) {
    return {
      account,
      address: contractAddress,
      functionName,
      args,
      abi,
      value,
    };
  }
  async write(params: any) {
    try {
      const result = await this.viemConfig.writeContract(...params);

      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async read() {
    try {
    } catch (error) {
      console.log(error);
    }
  }
}
