import { Pool, types } from "pg";
import { env } from "../config/env";

const DATE_OID = 1082;

types.setTypeParser(DATE_OID, (val) => val);

const pool = new Pool({
  host: env.PGHOST,
  port: Number(env.PGPORT),
  user: env.PGUSER,
  password: env.PGPASSWORD,
  database: env.PGDATABASE,
  options: `-c search_path=${env.PGSCHEMA}`,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
  statement_timeout: 30_000,
});

// Sin este listener, un corte de una conexión inactiva tumba el proceso.
pool.on("error", (err) => {
  console.error("Error en una conexión inactiva de PostgreSQL:", err.message);
});

export default pool;
