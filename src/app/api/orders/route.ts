import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders } from "@/db/schema";

export const dynamic = "force-dynamic";

/* ---------------- Zod schema ---------------- */
const OrderSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().min(3).max(3).default("INR"),
  cashbackAmount: z.number().min(0).default(0),
  paymentProvider: z.string().optional(),
  paymentRef: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/* ---------------- POST — Zod-validated order creation ---------------- */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = OrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const row = parsed.data;

  const [inserted] = await db
    .insert(orders)
    .values({
      userId: row.userId,
      productId: row.productId,
      status: "pending",
      amount: String(row.amount.toFixed(2)),
      currency: row.currency,
      cashbackAmount: String(row.cashbackAmount.toFixed(2)),
      paymentProvider: row.paymentProvider ?? null,
      paymentRef: row.paymentRef ?? null,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
    })
    .returning();

  return NextResponse.json({ order: inserted }, { status: 201 });
}
