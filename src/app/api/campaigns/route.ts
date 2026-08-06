import { NextResponse } from "next/server";
import { db } from "@/db";
import { automationCampaigns } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const campaigns = await db
      .select()
      .from(automationCampaigns)
      .orderBy(desc(automationCampaigns.createdAt));
    return NextResponse.json({ campaigns });
  } catch (err) {
    console.warn("Could not fetch campaigns:", err);
    return NextResponse.json({ campaigns: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, triggerKeywords, replyTemplate, matchMode } = body;

    if (!name || !triggerKeywords || !replyTemplate) {
      return NextResponse.json(
        { error: "Name, Trigger Keywords, and Reply Template are required" },
        { status: 400 }
      );
    }

    const [newCampaign] = await db
      .insert(automationCampaigns)
      .values({
        name: String(name),
        triggerKeywords: String(triggerKeywords),
        replyTemplate: String(replyTemplate),
        matchMode: matchMode === "word" ? "word" : "partial",
        isActive: true,
      })
      .returning();

    return NextResponse.json({ success: true, campaign: newCampaign });
  } catch (err) {
    console.error("Failed to create campaign:", err);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, triggerKeywords, replyTemplate, matchMode, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Campaign ID required for update" }, { status: 400 });
    }

    const [updated] = await db
      .update(automationCampaigns)
      .set({
        ...(name && { name: String(name) }),
        ...(triggerKeywords && { triggerKeywords: String(triggerKeywords) }),
        ...(replyTemplate && { replyTemplate: String(replyTemplate) }),
        ...(matchMode && { matchMode: matchMode === "word" ? "word" : "partial" }),
        ...(typeof isActive === "boolean" && { isActive }),
        updatedAt: new Date(),
      })
      .where(eq(automationCampaigns.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, campaign: updated });
  } catch (err) {
    console.error("Failed to update campaign:", err);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await db.delete(automationCampaigns).where(eq(automationCampaigns.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete campaign:", err);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}

