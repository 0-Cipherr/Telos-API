CREATE TABLE IF NOT EXISTS Bridges{
  id PRIMARY Key,
  API_KEY TEXT NOT NULL,
  bridgeName VARCHAR(100) NOT NULL,
  chainsAvailable INTEGER[] NOT NULL,
  baseUrl TEXT NOT NULL
};


CREATE TABLE Vaults if NOT EXISTS{
 id PRIMARY key,
  vaultName TEXT, --vaultName
  vaultTicker TEXT,
  vaultChains Array(NUMBER), -- array of chains vualt is on
  creator TEXT NOT NULL, --creator 
  addresses Array(Text) -- array of the vaults addresses must match chains legnth and indexes as well
};

CREATE TABLE DeploymentsManager{
  id PRIMARY KEY,
  chainId NUMERIC,
  deploymentRef FOREIGN Key REFERENCES Deployments(id)
};

CREATE TABLE Deployments IF NOT EXISTS{
  id PRIMARY key,
  contractType TEXT,
  contractAddress TEXT,
  abi JSONB NOT NULL,
};

CREATE TABLE VaultMetrics if NOT EXISTS {
  FOREIGN KEY (vault_id) REFERENCES Vault(vault_id),
  volume  number NOT NULL,
  protocolFees Number NOT NULL,
  apy Number Not NUll,
  #/alltime rewards 
}


CREATE TABLE HistoricalApy{
  vaultId FOREIGN Key REFERENCES Vaults(id),
  apy Number Not Null,
  apr Number Not Null,
  timestamp TIME,
}

INSERT INTO Bridges (API_KEY , bridgeName,chainsAvailable, baseUrl) VALUES ('Test', [], 'https://wtf.com');