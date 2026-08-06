import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import path from "node:path";

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/placeholder";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __neonMigrationRan?: boolean;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);

/**
 * Neon DB Auto-DDL Migration Guard:
 * Ensures all SQL migrations in drizzle/ folder are automatically checked
 * and applied to Neon DB before any API route or DB query executes.
 */
export async function ensureNeonDbMigrated() {
  if (!process.env.DATABASE_URL) return;
  if (globalForDb.__neonMigrationRan) return;
  try {
    const migrationsFolder = path.join(process.cwd(), "drizzle");
    await migrate(db, { migrationsFolder });
    globalForDb.__neonMigrationRan = true;
    console.log("✅ Neon DB Auto-DDL Migration Guard: Schema up to date.");
  } catch (err) {
    console.error("⚠️ Neon DB Auto-DDL Migration Guard Warning:", err);
  }
}
