export class Registry {
  private viemAccount: any;
  constructor() {}

  setViemAccount(newAccount: any) {
    this.viemAccount = newAccount;
  }

  async nativeQuote() {}
  async createVaultNative() {}

  async crossChainQuote() {}
  async creatVaultCrossChain() {}

  async deposit() {}

  async withdraw() {}
}

//idea have awwallet cal simple trnafer from n frontend or api to telos wallet api wallet wmanages funds
