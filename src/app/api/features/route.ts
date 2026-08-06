import { NextResponse } from "next/server";
import { db } from "@/db";
import { storyTriggers, leadSubscribers, igDmLogs } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

function isValidHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  if (!verifyAdminToken(req)) return unauthorizedResponse();
  try {
    const stories = await db
      .select()
      .from(storyTriggers)
      .orderBy(desc(storyTriggers.createdAt))
      .limit(50);

    const leads = await db
      .select()
      .from(leadSubscribers)
      .orderBy(desc(leadSubscribers.lastEngagedAt))
      .limit(50);

    const logs = await db
      .select()
      .from(igDmLogs)
      .orderBy(desc(igDmLogs.createdAt))
      .limit(20);

    const [stats] = await db.select({
      totalLeads: sql<number>`count(${leadSubscribers.id})`,
      totalDms: sql<number>`count(${igDmLogs.id})`
    }).from(leadSubscribers);

    return NextResponse.json({ stories, leads, logs, stats: stats || { totalLeads: 0, totalDms: 0 } });
  } catch (err) {
    console.warn("[FEATURES_GET]", err instanceof Error ? err.message : err);
    return NextResponse.json({ stories: [], leads: [], logs: [], stats: { totalLeads: 0, totalDms: 0 } });
  }
}

export async function POST(req: Request) {
  if (!verifyAdminToken(req)) return unauthorizedResponse();
  try {
    const body = await req.json();
    const { action, triggerName, storyKeyword, dmReplyTemplate, ctaButtonUrl } = body;

    if (action === "create_story") {
      if (!triggerName || !dmReplyTemplate) {
        return NextResponse.json({ error: "triggerName and dmReplyTemplate are required" }, { status: 400 });
      }

      // Validate CTA URL must be https://
      if (ctaButtonUrl && !isValidHttpsUrl(String(ctaButtonUrl))) {
        return NextResponse.json(
          { error: "ctaButtonUrl must be a valid https:// URL" },
          { status: 400 }
        );
      }

      const [newStory] = await db
        .insert(storyTriggers)
        .values({
          triggerName: String(triggerName).slice(0, 200).trim(),
          storyKeyword: storyKeyword ? String(storyKeyword).slice(0, 200).trim() : null,
          dmReplyTemplate: String(dmReplyTemplate).slice(0, 2000).trim(),
          ctaButtonUrl: ctaButtonUrl ? String(ctaButtonUrl).slice(0, 500) : null,
          isActive: true,
        })
        .returning();

      return NextResponse.json({ success: true, story: newStory });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[FEATURES_POST]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
