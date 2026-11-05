export type VaultSeedConfig = {
  chainsConfigsId: Number;
  vaultId: Number;
  volume: Number;
  protocolFees: Number;
  agentWalletAddress: String;
  agentUserName: String;
  apy: Number;
  vaultName: String;
  vaultTicker: string;
  creatorId: Number;
};

export type HistoricalAPY = {
  vaultId: Number;
  apy: Number;
  apr: Number;
  time: Number;
};
