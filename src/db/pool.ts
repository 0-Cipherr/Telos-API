import pg from "pg";

const { Pool } = pg;

// Credentials come from the environment so the same code works locally, in
// Docker Compose (POSTGRES_HOST=db), and on a deployed server.
const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "admin1234",
  database: process.env.POSTGRES_DB || "admin",
});

// A dropped/unreachable database must not take the whole API down: the chat
// and audit proxy do not depend on Postgres.
pool.on("error", (error) => {
  console.error("[db] idle client error:", error.message);
});

export default pool;
