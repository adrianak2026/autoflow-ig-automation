import { NextResponse } from "next/server";
import { db } from "@/db";
import { automationCampaigns } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_NAME_LEN = 200;
const MAX_KEYWORDS_LEN = 1000;
const MAX_TEMPLATE_LEN = 2000;
const MAX_URL_LEN = 500;

function sanitizeMatchMode(m: unknown): "partial" | "word" | "any" {
  if (m === "word") return "word";
  if (m === "any") return "any";
  return "partial";
}

export async function GET(req: Request) {
  // GET is read-only — still require auth to protect lead data
  if (!verifyAdminToken(req)) return unauthorizedResponse();
  try {
    const campaigns = await db
      .select()
      .from(automationCampaigns)
      .orderBy(desc(automationCampaigns.createdAt))
      .limit(100);
    return NextResponse.json({ campaigns });
  } catch (err) {
    console.warn("[CAMPAIGNS_GET]", err instanceof Error ? err.message : err);
    return NextResponse.json({ campaigns: [] });
  }
}

export async function POST(req: Request) {
  if (!verifyAdminToken(req)) return unauthorizedResponse();
  try {
    const body = await req.json();
    const { name, triggerKeywords, replyTemplate, matchMode } = body;

    if (!name || !triggerKeywords || !replyTemplate) {
      return NextResponse.json(
        { error: "Name, Trigger Keywords, and Reply Template are required" },
        { status: 400 }
      );
    }

    // Input length limits to prevent abuse
    const safeName = String(name).slice(0, MAX_NAME_LEN).trim();
    const safeKeywords = String(triggerKeywords).slice(0, MAX_KEYWORDS_LEN).trim();
    const safeTemplate = String(replyTemplate).slice(0, MAX_TEMPLATE_LEN).trim();

    if (!safeName || !safeKeywords || !safeTemplate) {
      return NextResponse.json({ error: "Inputs must not be empty after trimming." }, { status: 400 });
    }

    const [newCampaign] = await db
      .insert(automationCampaigns)
      .values({
        name: safeName,
        triggerKeywords: safeKeywords,
        replyTemplate: safeTemplate,
        matchMode: sanitizeMatchMode(matchMode),
        reelUrl: body.reelUrl ? String(body.reelUrl).slice(0, MAX_URL_LEN).trim() : null,
        isActive: true,
      })
      .returning();

    return NextResponse.json({ success: true, campaign: newCampaign });
  } catch (err) {
    console.error("[CAMPAIGNS_POST]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!verifyAdminToken(req)) return unauthorizedResponse();
  try {
    const body = await req.json();
    const { id, name, triggerKeywords, replyTemplate, matchMode, isActive } = body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Valid campaign ID required for update" }, { status: 400 });
    }

    const [updated] = await db
      .update(automationCampaigns)
      .set({
        ...(name && { name: String(name).slice(0, MAX_NAME_LEN).trim() }),
        ...(triggerKeywords && { triggerKeywords: String(triggerKeywords).slice(0, MAX_KEYWORDS_LEN).trim() }),
        ...(replyTemplate && { replyTemplate: String(replyTemplate).slice(0, MAX_TEMPLATE_LEN).trim() }),
        ...(matchMode && { matchMode: sanitizeMatchMode(matchMode) }),
        ...(typeof isActive === "boolean" && { isActive }),
        ...("reelUrl" in body && { reelUrl: body.reelUrl ? String(body.reelUrl).slice(0, MAX_URL_LEN).trim() : null }),
        updatedAt: new Date(),
      })
      .where(eq(automationCampaigns.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, campaign: updated });
  } catch (err) {
    console.error("[CAMPAIGNS_PUT]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!verifyAdminToken(req)) return unauthorizedResponse();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Valid numeric ID required" }, { status: 400 });
    }

    await db.delete(automationCampaigns).where(eq(automationCampaigns.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CAMPAIGNS_DELETE]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
