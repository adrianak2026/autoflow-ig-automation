import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { getEnv } from "@/lib/env";

// Provide a proxy to lazy-load the database connection per-request
// This ensures getEnv("DATABASE_URL") is evaluated during the request
// when Cloudflare worker bindings are available.
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const databaseUrl = getEnv("DATABASE_URL");
    if (!databaseUrl) {
      console.error("[DB] DATABASE_URL environment variable is not set at runtime!");
    }
    const sql = neon(databaseUrl || "postgres://dummy:dummy@dummy/dummy");
    const instance = drizzle({ client: sql });
    return (instance as any)[prop];
  }
});

export async function ensureNeonDbMigrated() {
  return Promise.resolve();
}



