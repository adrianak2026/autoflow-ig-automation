import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { getEnv } from "@/lib/env";

const databaseUrl = getEnv("DATABASE_URL");
if (!databaseUrl) {
  console.error("[DB] DATABASE_URL environment variable is not set!");
}

const sql = neon(databaseUrl!);

export const db = drizzle({ client: sql });

export async function ensureNeonDbMigrated() {
  return Promise.resolve();
}



