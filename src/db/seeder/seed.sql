CREATE TABLE IF NOT EXISTS Bridges{
<<<<<<< HEAD
  vault_id PRIMARY Key,
=======
  id PRIMARY Key,
>>>>>>> 28e5ad1d2478268bc3c1c68479ae748832f9c07b
  API_KEY TEXT NOT NULL,
  bridgeName VARCHAR(100) NOT NULL,
  chainsAvailable INTEGER[] NOT NULL,
  baseUrl TEXT NOT NULL
};


CREATE TABLE Vaults if NOT EXISTS{
 id PRIMARY key,
  vaultName TEXT,
  vaultChains Array(NUMBER),
  creator TEXT NOT NULL
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
  atr number NOT NULL,
  #/alltime rewards 
}


INSERT INTO Bridges (API_KEY , bridgeName,chainsAvailable, baseUrl) VALUES ('Test', [], 'https://wtf.com');