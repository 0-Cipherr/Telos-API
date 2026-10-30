import pool from "../db/pool.js";

export type ScheduledStrategyInput = {
  vaultId: number | null;
  name: string;
  description: string;
  protocol: string;
  chainId: number;
  entryPoint: string | null;
  exitPoint: string | null;
  apy: number;
  riskLevel: number | null;
  configuration: Record<string, unknown>;
  /** null = publish once at startAt. Otherwise publish every N days. */
  intervalDays: number | null;
  startAt: Date;
};

const POLL_MS = 60_000;
const BATCH_SIZE = 20;

export function parseScheduledStrategy(body: unknown): { value?: ScheduledStrategyInput; error?: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

  const name = str(b.name, 100);
  const protocol = str(b.protocol, 100);
  if (!name || !protocol) return { error: "name and protocol are required" };
  if (!Number.isInteger(b.chainId)) return { error: "chainId must be an integer" };

  const intervalDays = b.intervalDays === undefined || b.intervalDays === null ? null : Number(b.intervalDays);
  if (intervalDays !== null && (!Number.isInteger(intervalDays) || intervalDays < 1 || intervalDays > 90)) {
    return { error: "intervalDays must be an integer from 1 to 90, or omitted for a single release" };
  }

  const vaultId = b.vaultId === undefined || b.vaultId === null ? null : Number(b.vaultId);
  if (vaultId !== null && !Number.isInteger(vaultId)) return { error: "vaultId must be an integer or omitted" };

  const riskLevel = b.riskLevel === undefined || b.riskLevel === null ? null : Number(b.riskLevel);
  if (riskLevel !== null && (!Number.isInteger(riskLevel) || riskLevel < 1 || riskLevel > 5)) {
    return { error: "riskLevel must be 1-5" };
  }

  const startAt = b.startAt ? new Date(String(b.startAt)) : new Date();
  if (Number.isNaN(startAt.getTime())) return { error: "startAt must be an ISO date" };

  return {
    value: {
      vaultId,
      name,
      description: str(b.description, 2000),
      protocol,
      chainId: Number(b.chainId),
      entryPoint: str(b.entryPoint, 100) || null,
      exitPoint: str(b.exitPoint, 100) || null,
      apy: Number(b.apy) || 0,
      riskLevel,
      configuration:
        b.configuration && typeof b.configuration === "object" ? (b.configuration as Record<string, unknown>) : {},
      intervalDays,
      startAt,
    },
  };
}

export async function createScheduledStrategy(input: ScheduledStrategyInput) {
  const { rows } = await pool.query(
    `INSERT INTO ScheduledStrategies
       (vault_id, name, description, protocol, chain_id, entry_point, exit_point,
        apy, risk_level, configuration, interval_days, next_run_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      input.vaultId,
      input.name,
      input.description,
      input.protocol,
      input.chainId,
      input.entryPoint,
      input.exitPoint,
      input.apy,
      input.riskLevel,
      JSON.stringify(input.configuration),
      input.intervalDays,
      input.startAt,
    ],
  );
  return rows[0];
}

export async function listScheduledStrategies() {
  const { rows } = await pool.query(
    "SELECT * FROM ScheduledStrategies ORDER BY status, next_run_at",
  );
  return rows;
}

// Publishes every due release: one Strategies row per target vault, which also
// becomes that vault's current strategy. Runs in one transaction, so a failure
// leaves the schedule untouched and the next tick retries.
export async function publishDueStrategies(): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const due = await client.query(
      `SELECT * FROM ScheduledStrategies
       WHERE status = 'scheduled' AND next_run_at <= NOW()
       ORDER BY next_run_at
       LIMIT $1
       FOR UPDATE SKIP LOCKED`,
      [BATCH_SIZE],
    );

    let published = 0;
    for (const release of due.rows) {
      const vaults = release.vault_id
        ? await client.query("SELECT id FROM Vaults WHERE id = $1", [release.vault_id])
        : await client.query("SELECT id FROM Vaults");

      for (const vault of vaults.rows) {
        const strategy = (await client.query(
          `INSERT INTO Strategies
             (vault_id, name, description, protocol, chain_id, entry_point, exit_point,
              apy, risk_level, configuration)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING id`,
          [
            vault.id,
            release.name,
            release.description,
            release.protocol,
            release.chain_id,
            release.entry_point,
            release.exit_point,
            release.apy,
            release.risk_level,
            JSON.stringify(release.configuration),
          ],
        )).rows[0];
        await client.query(
          `INSERT INTO CurrentStrategy (vault_id, strategy_id) VALUES ($1, $2)
           ON CONFLICT (vault_id) DO UPDATE SET strategy_id = EXCLUDED.strategy_id, updated_at = NOW()`,
          [vault.id, strategy.id],
        );
        published += 1;
      }

      // Recurring releases jump to the first slot after now, so missed runs
      // collapse into one release instead of a burst.
      if (release.interval_days === null) {
        await client.query(
          "UPDATE ScheduledStrategies SET status = 'published', last_published_at = NOW() WHERE id = $1",
          [release.id],
        );
      } else {
        await client.query(
          `UPDATE ScheduledStrategies
           SET last_published_at = NOW(),
               next_run_at = next_run_at + make_interval(
                 days => interval_days * (FLOOR(EXTRACT(EPOCH FROM (NOW() - next_run_at)) / 86400.0 / interval_days)::int + 1)
               )
           WHERE id = $1`,
          [release.id],
        );
      }
    }

    await client.query("COMMIT");
    return published;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

let running = false;

async function tick() {
  if (running) return;
  running = true;
  try {
    const published = await publishDueStrategies();
    if (published > 0) console.log(`[scheduled-strategies] published ${published} strategy rows`);
  } catch (error) {
    console.error("[scheduled-strategies] tick failed:", error);
  } finally {
    running = false;
  }
}

export function startScheduledStrategyPublisher() {
  setInterval(() => void tick(), POLL_MS);
  void tick();
}

