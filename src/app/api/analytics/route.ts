import { NextResponse } from "next/server";
import { db } from "@/db";
import { leadSubscribers } from "@/db/schema";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/auth";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!verifyAdminToken(req)) return unauthorizedResponse();
  try {
    // Generate the last 7 days series data grouping by date
    const query = sql`
      WITH dates AS (
        SELECT generate_series(
          current_date - interval '6 days',
          current_date,
          '1 day'::interval
        )::date AS date
      )
      SELECT 
        TO_CHAR(d.date, 'Mon DD') as name,
        COUNT(l.id)::int as leads
      FROM dates d
      LEFT JOIN ${leadSubscribers} l 
        ON DATE(l.last_engaged_at) = d.date
      GROUP BY d.date
      ORDER BY d.date ASC;
    `;

    const { rows } = await db.execute(query);
    
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.warn("[ANALYTICS_GET]", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
