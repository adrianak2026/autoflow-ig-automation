import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-http/migrator";
import path from "path";
import { verifyAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. Verify Admin Token
    const authError = await verifyAuth(req);
    if (authError) {
      return authError;
    }

    // 2. Setup Neon DB Connection
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json(
        { error: "DATABASE_URL is not set" },
        { status: 500 }
      );
    }

    const sql = neon(databaseUrl);
    const db = drizzle(sql);

    // 3. Run Migrations
    // Note: next.config.ts has outputFileTracingIncludes to bundle this folder
    const migrationsFolder = path.join(process.cwd(), "drizzle");

    await migrate(db, { migrationsFolder });

    return NextResponse.json({
      success: true,
      message: "Database migrated and initialized successfully!",
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: error.message },
      { status: 500 }
    );
  }
}
