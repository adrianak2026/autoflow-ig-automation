import { db, ensureNeonDbMigrated } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureNeonDbMigrated();
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, status: "Neon DB Healthy & Migrated" });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
