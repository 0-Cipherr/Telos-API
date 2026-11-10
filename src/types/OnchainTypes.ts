export type address = `0x${string}`;

export type VaultSeedConfig = {
  vaultName: string;
  vaultTicker: string;
  creatorId: number;
  chainsConfigId: Number;
  agentAddress: string;
  creatorFee: number;
};
export type VaultCollectionInfo = {
  address: string;
  volume: number;
  feesEarned: number;
};
export type TelosUser = {
  address: string;
  volume: number;
  feesEarned: number;
};
