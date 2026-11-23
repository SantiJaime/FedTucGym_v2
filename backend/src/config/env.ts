import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const required = (name: string) =>
  z.string().min(1, `La variable ${name} es requerida`);

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  PGHOST: required("PGHOST"),
  PGPORT: required("PGPORT"),
  PGUSER: required("PGUSER"),
  PGDATABASE: required("PGDATABASE"),
  PGPASSWORD: required("PGPASSWORD"),
  PGSCHEMA: required("PGSCHEMA"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
  COOKIE_SECRET: required("COOKIE_SECRET"),
  NODE_ENV: required("NODE_ENV"),
  SHEETS_SCRIPT_URL: required("SHEETS_SCRIPT_URL"),
  SHEETS_SECRET: required("SHEETS_SECRET"),
  CRON_SECRET: required("CRON_SECRET")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Error de validación en variables de entorno:");
  parsed.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  });
  throw new Error("Faltan variables de entorno");
}

export const env = parsed.data;
