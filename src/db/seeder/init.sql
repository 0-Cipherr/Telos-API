



create TABLE AgentFourms(
  id PRIMARY KEY
  agentId  FOREIGN Key REFERENCES Agents(id),
thesis JSON,
)

create TABLE AgentTask(
  id PRIMARY KEY,
  agentId  FOREIGN Key REFERENCES Agents(id),
  vaultId FOREIGN Key REFERENCES Vaults(id)
);



create Table TelosAPIKy(
  id PRIMARY KEY,
  creatorId  FOREIGN Key REFERENCES creators(id),
  KEY TEXT NOT NULL

)


create TABLE Chains(
  id PRIMARY KEY,
  chainId Number NOT NULL,
  endpointId Number NOT NULL,
  endpoint TEXT NOT NULL
);

CREATE TABLE Depositors(
  creatorId FOREIGN References Creators(id),
  vaultId FOREIGN References Vaults(id)
);

CREATE TABLE  Creators (
id PRIMARY KEY,
creatorAddress TEXT NOT NULL
);




CREATE TABLE Vaults if NOT EXISTS{
 id PRIMARY key,
  vaultName TEXT, --vaultName
  vaultTicker TEXT,
  chainId FOREIGN KEY References Chains(id),
  creatorId  FOREIGN Key REFERENCES Creators(id),
};

CREATE TABLE Agents (
id SERIAL PRIMARY KEY,
llm JSON,
key TEXT NOT NULL, --api key for openrouter for agent 
creatorId FOREIGN Key REFERENCES creatorId(creator),
walletReference NUMBER NOT NULL, -- pints to api where we can manage custodial wallets too much risk putting key in db 
model VARCHAR(100) NOT NULL
);



CREATE TABLE VaultMetrics if NOT EXISTS {
  FOREIGN KEY (vault_id) REFERENCES Vault(vault_id),
  volume  number NOT NULL,
  protocolFees Number NOT NULL,
  apy Number Not NUll,
  #/alltime rewards 
}


CREATE TABLE VaultReturns{
  vaultId FOREIGN Key REFERENCES Vaults(id),
  apy Number Not Null,
  apr Number Not Null,
  timestamp TIME,
}

-- INSERT INTO Bridges (API_KEY , bridgeName,chainsAvailable, baseUrl) VALUES ('Test', [], 'https://wtf.com');
CREATE TABLE VaultHolders(
creatorId FOREIGN KEY REFERENCES Creators(id),
vaultId FOREIGN Key REFERENCES Vaults(id)
)

CREATE TABLE CurrentStrategy(
  strategyId FOREIGN Key REFERENCES strategies(id),
  vaultId FOREIGN Key REFERENCES Vaults(id)
)
CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,
    description TEXT,

    creator_address VARCHAR(100) NOT NULL,
    protocol VARCHAR(100) NOT NULL,

    chainId FOREIGN KEY References Chains(chainId),
    contract_address VARCHAR(100),

    entry_point VARCHAR(100),
    exit_point VARCHAR(100),

    apy NUMERIC(12,6) DEFAULT 0,
    tvl NUMERIC(78,0) DEFAULT 0,

    min_deposit NUMERIC(78,0),
    max_deposit NUMERIC(78,0),

    risk_level SMALLINT,

    status VARCHAR(20) DEFAULT 'active',

    configuration JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_strategies_creator
    ON strategies(creator_address);

CREATE INDEX idx_strategies_chain
    ON strategies(chain_id);

CREATE INDEX idx_strategies_status
    ON strategies(status);