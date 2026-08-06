import { NextResponse } from "next/server";
import { db } from "@/db";
import { storyTriggers, leadSubscribers, igDmLogs } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stories = await db
      .select()
      .from(storyTriggers)
      .orderBy(desc(storyTriggers.createdAt));

    const leads = await db
      .select()
      .from(leadSubscribers)
      .orderBy(desc(leadSubscribers.lastEngagedAt))
      .limit(10);

    const logs = await db
      .select()
      .from(igDmLogs)
      .orderBy(desc(igDmLogs.createdAt))
      .limit(10);

    const [stats] = await db.select({
      totalLeads: sql<number>`count(${leadSubscribers.id})`,
      totalDms: sql<number>`count(${igDmLogs.id})`
    }).from(leadSubscribers);

    return NextResponse.json({ stories, leads, logs, stats: stats || { totalLeads: 0, totalDms: 0 } });
  } catch (err) {
    console.warn("Could not fetch extra features:", err);
    return NextResponse.json({ stories: [], leads: [], logs: [], stats: { totalLeads: 0, totalDms: 0 } });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, triggerName, storyKeyword, dmReplyTemplate, ctaButtonUrl } = body;

    if (action === "create_story") {
      const [newStory] = await db
        .insert(storyTriggers)
        .values({
          triggerName: String(triggerName),
          storyKeyword: storyKeyword ? String(storyKeyword) : null,
          dmReplyTemplate: String(dmReplyTemplate),
          ctaButtonUrl: ctaButtonUrl ? String(ctaButtonUrl) : null,
          isActive: true,
        })
        .returning();

      return NextResponse.json({ success: true, story: newStory });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Failed to process extra feature POST:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
