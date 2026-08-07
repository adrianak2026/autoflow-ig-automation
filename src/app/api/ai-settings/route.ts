import { NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!verifyAdminToken(req)) return unauthorizedResponse();

  try {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "ai_config"))
      .limit(1);

    if (!setting) {
      return NextResponse.json({
        providerName: "",
        endpointUrl: "https://api.openai.com/v1",
        modelName: "",
        apiKey: "",
        isEnabled: false,
      });
    }

    return NextResponse.json(setting.valueJson);
  } catch (err) {
    console.error("[AI_SETTINGS_GET]", err);
    return NextResponse.json({ error: "Failed to fetch AI settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!verifyAdminToken(req)) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { providerName, endpointUrl, modelName, apiKey, isEnabled } = body;

    const payload = {
      providerName: String(providerName || ""),
      endpointUrl: String(endpointUrl || ""),
      modelName: String(modelName || ""),
      apiKey: String(apiKey || ""),
      isEnabled: Boolean(isEnabled),
    };

    const existing = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "ai_config"))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(systemSettings)
        .set({ valueJson: payload, updatedAt: new Date() })
        .where(eq(systemSettings.key, "ai_config"));
    } else {
      await db.insert(systemSettings).values({
        key: "ai_config",
        valueJson: payload,
        description: "AI Auto-Reply Configuration",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[AI_SETTINGS_POST]", err);
    return NextResponse.json({ error: "Failed to save AI settings" }, { status: 500 });
  }
}
