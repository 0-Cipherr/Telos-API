CREATE TABLE Bridges (
  id INT PRIMARY KEY,
  API_KEY TEXT NOT NULL,
  bridgeName TEXT NOT NULL,
  chainsAvailable INTEGER NOT NULL,
  baseUrl TEXT NOT NULL
);

CREATE TABLE Vaults (
  id INT PRIMARY KEY,
  vaultName TEXT, --vaultName
  vaultTicker TEXT,
  creatorId INT NOT NULL,
  FOREIGN KEY (creatorId) REFERENCES TelosUsers(id),
  chainsConfigId INT NOT NULL,
  FOREIGN KEY (chainsConfigId) REFERENCES chainsConfigs(id) -- if vault deployed on multiple chais it should have mltile rows 
);

CREATE TABLE VaultsCollection (
  vaultId INT NOT NULL,
  chainsConfigsId INT NOT NULL,
  PRIMARY KEY (vaultId, chainsConfigId), --here u can add as many primary keys as u want 
  FOREIGN KEY (vaultId) REFERENCES vaults (id)
);
CREATE TABLE chainsConfigs (
  id INT PRIMARY KEY,
  chainId NUMBER,
  endpoint VARCHAR(65) NOT NULL,
  endpointId VARCHAR(65) NOT NULL
);

CREATE TABLE TelosAgent (
  id INT PRIMARY KEY,
  walletAddress TEXT,
  FOREIGN Key (id) REFERENCES Vaults (id),
  userId INT NOT NULL,
  FOREIGN Key (creatorId) REFERENCES TelosUsers(id),
  creatorUserName TEXT NOT NULL
);

CREATE TABLE TelosUsers(
  id INT PRIMARY KEY,
  address TEXT NOT NULL,
  volume INT NOT NULL,
  feesEarned INT NOT NULL
);

CREATE TABLE VaultDeployments(
  vaultId INT NOT NULL,
  FOREIGN KEY (vaultId) REFERENCES Vaults(id),

);

CREATE TABLE VaultMetrics (
  vault_id INT NOT NULL,
  PRIMARY KEY (vault_id),
  FOREIGN KEY (vault_id) REFERENCES Vault (vault_id),
  volume number NOT NULL,
  protocolFees Number NOT NULL,
  apy Number Not NUll,
  -- #/alltime rewards 
);

CREATE TABLE HistoricalApy (
  vaultId INT PRIMARY KEY NOT NULL,
  FOREIGN Key (vaultId) REFERENCES Vaults (id),
  apy Number Not Null,
  apr Number Not Null,
  timestamp TIME,
);

-- INSERT INTO Bridges (API_KEY , bridgeName,chainsAvailable, baseUrl) VALUES ('Test', [], 'https://wtf.com');
