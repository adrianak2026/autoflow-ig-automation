import { NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getEnv } from "@/lib/env";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/auth";
import { encryptSymmetric, decryptSymmetric } from "@/lib/crypto";

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

    const value = setting.valueJson as any;
    const secretToken = getEnv("ADMIN_SECRET_TOKEN");
    if (value && value.apiKey && secretToken) {
      value.apiKey = await decryptSymmetric(value.apiKey, secretToken);
    }

    return NextResponse.json(value);
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

    let finalApiKey = String(apiKey || "");
    const secretToken = getEnv("ADMIN_SECRET_TOKEN");
    if (finalApiKey && secretToken) {
      finalApiKey = await encryptSymmetric(finalApiKey, secretToken);
    }

    const payload = {
      providerName: String(providerName || ""),
      endpointUrl: String(endpointUrl || ""),
      modelName: String(modelName || ""),
      apiKey: finalApiKey,
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
