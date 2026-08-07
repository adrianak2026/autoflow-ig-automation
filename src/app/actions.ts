"use server";

import { db } from "@/db";
import { users, automationCampaigns } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function seedInitialAdmin() {
  const [adminUser] = await db
    .insert(users)
    .values({
      email: "admin@autoflow.ig",
      username: "admin",
      displayName: "AutoFlow Admin",
      role: "admin",
    })
    .onConflictDoNothing()
    .returning();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "admin@autoflow.ig"))
    .limit(1);
  const ownerId = adminUser?.id ?? existing?.id ?? null;

  if (ownerId) {
    // Demo campaign seed removed for production grade safety
  }

  return { ok: true };
}
