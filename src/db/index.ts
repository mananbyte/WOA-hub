import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";
import { config } from "../config.js";

const { Pool } = pg;

const isRemoteOrProd =
  process.env.NODE_ENV === "production" ||
  Boolean(process.env.VERCEL) ||
  config.databaseUrl.includes("supabase.co") ||
  config.databaseUrl.includes("supabase.com") ||
  config.databaseUrl.includes("pooler.supabase.com");

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: isRemoteOrProd ? { rejectUnauthorized: false } : undefined,
  max: process.env.VERCEL ? 5 : 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });
