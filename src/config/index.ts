import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

const env = process.env.NODE_ENV;
const envPath = path.resolve(process.cwd(), `.env.${env}`);
dotenv.config({
  path:envPath
});

const envSchema = z.object({
  ODOO_URL: z.string().url(),
  ODOO_DB: z.string().min(1),
  ODOO_USERNAME: z.string().min(1),
  ODOO_PASSWORD: z.string().min(1),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.error("Variables de entorno inválidas o faltantes.");
  throw new Error(
    `Invalid Environment Configuration: ${JSON.stringify(envVars.error.format(), null, 2)}`
  );
}

export const config = {
  odoo: {
    url: envVars.data.ODOO_URL,
    db: envVars.data.ODOO_DB,
    username: envVars.data.ODOO_USERNAME,
    password: envVars.data.ODOO_PASSWORD,
  },
  logging: {
    level: envVars.data.LOG_LEVEL,
  }
};