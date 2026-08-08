import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { getEnv } from "@/lib/env";

export async function POST(req: Request) {
  try {
    // 1. Verify Admin Token
    if (!verifyAdminToken(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Setup Neon DB Connection
    const databaseUrl = getEnv("DATABASE_URL");
    if (!databaseUrl) {
      return NextResponse.json(
        { error: "DATABASE_URL is not set" },
        { status: 500 }
      );
    }

    // `runDatabaseInit` will use the lazy-loaded Proxy db connection automatically!
    
    // 3. Run Migrations manually (bypassing fs-based migrate)
    const { runDatabaseInit } = await import("@/db/init");
    await runDatabaseInit();

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
