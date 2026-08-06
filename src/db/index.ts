import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/placeholder";

const sql = neon(databaseUrl);

export const db = drizzle({ client: sql });

export async function ensureNeonDbMigrated() {
  return Promise.resolve();
}



