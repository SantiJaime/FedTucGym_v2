// Solo desarrollo local: en Vercel la función de api/index.mjs importa app.ts.
import app from "./app";
import pool from "./database/db.config";
import { env } from "./config/env";

pool
  .query("SELECT NOW()")
  .then(() => console.log("✅ Conexión a PostgreSQL exitosa"))
  .catch((err) => console.error("❌ Error al conectar a PostgreSQL:", err));

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
