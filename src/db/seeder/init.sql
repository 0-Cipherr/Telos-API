-- Telos database schema. Runs once when the Postgres volume is first created
-- (mounted into /docker-entrypoint-initdb.d by docker-compose.yaml).
-- The database is the glue between chains: every vault row maps an on-chain
-- vault (chain_id + onchain_vault_id) to its creator, agent and strategies.

-- privy_user_id is the verified Privy DID from the access token; it is what
-- actually identifies a creator. wallet_address is display/lookup data.
CREATE TABLE IF NOT EXISTS Creators (
    id SERIAL PRIMARY KEY,
    privy_user_id VARCHAR(64) NOT NULL UNIQUE,
    wallet_address VARCHAR(42) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One Telos API key per creator, issued automatically on first wallet connect.
CREATE TABLE IF NOT EXISTS TelosApiKeys (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER NOT NULL REFERENCES Creators(id) ON DELETE CASCADE,
    api_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Chains (
    id SERIAL PRIMARY KEY,
    chain_id INTEGER NOT NULL UNIQUE,
    endpoint_id INTEGER NOT NULL,
    endpoint TEXT NOT NULL
);

-- Native ETH vaults deployed through VaultFactory on a single chain.
CREATE TABLE IF NOT EXISTS Vaults (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER NOT NULL REFERENCES Creators(id) ON DELETE CASCADE,
    chain_id INTEGER NOT NULL,
    onchain_vault_id BIGINT NOT NULL,
    vault_address VARCHAR(42) NOT NULL,
    vault_name VARCHAR(100) NOT NULL,
    vault_ticker VARCHAR(20) NOT NULL,
    creator_fee_bps INTEGER NOT NULL DEFAULT 0 CHECK (creator_fee_bps BETWEEN 0 AND 10000),
    protocol_fee_bps INTEGER NOT NULL DEFAULT 400 CHECK (protocol_fee_bps BETWEEN 0 AND 10000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (chain_id, onchain_vault_id),
    UNIQUE (chain_id, vault_address)
);

-- The AI agent plugged into a vault. Its OpenRouter sub-key is provisioned
-- automatically by the backend; users never copy or paste it.
CREATE TABLE IF NOT EXISTS Agents (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER NOT NULL REFERENCES Creators(id) ON DELETE CASCADE,
    vault_id INTEGER NOT NULL UNIQUE REFERENCES Vaults(id) ON DELETE CASCADE,
    model VARCHAR(100) NOT NULL,
    openrouter_key_hash TEXT NOT NULL UNIQUE,
    openrouter_key TEXT NOT NULL,
    rethink_interval_minutes INTEGER NOT NULL DEFAULT 1440 CHECK (rethink_interval_minutes >= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scheduled "rethink" jobs. The agent task manager picks rows whose
-- next_run_at has passed and asks the agent for a new strategy.
CREATE TABLE IF NOT EXISTS AgentTasks (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES Agents(id) ON DELETE CASCADE,
    vault_id INTEGER NOT NULL REFERENCES Vaults(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    next_run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_run_at TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agenttasks_due ON AgentTasks(status, next_run_at);

-- Depositors: which creators hold shares in which vault.
CREATE TABLE IF NOT EXISTS Depositors (
    creator_id INTEGER NOT NULL REFERENCES Creators(id) ON DELETE CASCADE,
    vault_id INTEGER NOT NULL REFERENCES Vaults(id) ON DELETE CASCADE,
    PRIMARY KEY (creator_id, vault_id)
);

CREATE TABLE IF NOT EXISTS Strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vault_id INTEGER REFERENCES Vaults(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES Agents(id) ON DELETE SET NULL,

    name VARCHAR(100) NOT NULL,
    description TEXT,
    protocol VARCHAR(100) NOT NULL,

    chain_id INTEGER NOT NULL,
    contract_address VARCHAR(42),

    entry_point VARCHAR(100),
    exit_point VARCHAR(100),

    apy NUMERIC(12,6) NOT NULL DEFAULT 0,
    tvl NUMERIC(78,0) NOT NULL DEFAULT 0,

    min_deposit NUMERIC(78,0),
    max_deposit NUMERIC(78,0),

    risk_level SMALLINT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',

    configuration JSONB NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_strategies_vault ON Strategies(vault_id);
CREATE INDEX IF NOT EXISTS idx_strategies_chain ON Strategies(chain_id);
CREATE INDEX IF NOT EXISTS idx_strategies_status ON Strategies(status);

-- The strategy a vault is currently running (one row per vault).
CREATE TABLE IF NOT EXISTS CurrentStrategy (
    vault_id INTEGER PRIMARY KEY REFERENCES Vaults(id) ON DELETE CASCADE,
    strategy_id UUID NOT NULL REFERENCES Strategies(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Strategies you author yourself and release on a schedule. interval_days NULL
-- means a single release at next_run_at. vault_id NULL means every vault.
CREATE TABLE IF NOT EXISTS ScheduledStrategies (
    id SERIAL PRIMARY KEY,
    vault_id INTEGER REFERENCES Vaults(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,
    description TEXT,
    protocol VARCHAR(100) NOT NULL,
    chain_id INTEGER NOT NULL,

    entry_point VARCHAR(100),
    exit_point VARCHAR(100),
    apy NUMERIC(12,6) NOT NULL DEFAULT 0,
    risk_level SMALLINT CHECK (risk_level BETWEEN 1 AND 5),
    configuration JSONB NOT NULL DEFAULT '{}',

    interval_days INTEGER CHECK (interval_days BETWEEN 1 AND 90),
    next_run_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    last_published_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_strategies_due
    ON ScheduledStrategies(status, next_run_at);
