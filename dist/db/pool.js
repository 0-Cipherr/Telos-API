import pg from "pg";
const { Pool } = pg;
// Credentials come from the environment so the same code works locally, in
// Docker Compose (POSTGRES_HOST=db), and on a deployed server. There are no
// fallback credentials: a missing variable fails at startup.
function requireEnv(name) {
    const value = process.env[name];
    if (!value)
        throw new Error(`${name} is required`);
    return value;
}
const pool = new Pool({
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: requireEnv("POSTGRES_USER"),
    password: requireEnv("POSTGRES_PASSWORD"),
    database: requireEnv("POSTGRES_DB"),
    ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});
// A dropped/unreachable database must not take the whole API down: the chat
// and audit proxy do not depend on Postgres.
pool.on("error", (error) => {
    console.error("[db] idle client error:", error.message);
});
export default pool;
//# sourceMappingURL=pool.js.map