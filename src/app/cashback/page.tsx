import { db } from "@/db";
import { products, users } from "@/db/schema";
import { eq, and, inArray, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

/* Shared product card */
function ProductCard({ p }: { p: typeof products.$inferSelect }) {
  const price = Number(p.price).toLocaleString("en-IN", {
    style: "currency",
    currency: p.currency || "INR",
    maximumFractionDigits: 0,
  });
  const cb = Number(p.cashbackPct || 0);
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900">{p.title}</h3>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
            {p.type}
          </span>
        </div>
        <p className="mt-2 line-clamp-3 text-sm text-slate-600">{p.description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-lg font-bold text-slate-900">{price}</p>
        {cb > 0 && (
          <p className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
            {cb}% cashback
          </p>
        )}
      </div>
      {p.affiliateUrl && (
        <a
          href={p.affiliateUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block rounded-lg bg-slate-900 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-slate-800"
        >
          View deal →
        </a>
      )}
    </div>
  );
}

export default async function CashbackPage() {
  // Cashback & affiliate types
  const rows = await db
    .select()
    .from(products)
    .where(
      and(
        inArray(products.type, ["cashback_offer", "affiliate_deal"]),
        eq(products.isPublished, true),
      ),
    )
    .orderBy(products.createdAt);

  const isEmpty = rows.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
          KoshVerse · Deals
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Cashback & affiliate deals
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Earn cashback on every purchase or shop via our affiliate links. Products are
          served from Postgres via Drizzle.
        </p>
      </header>

      {isEmpty && (
        <EmptyState
          message="No deals yet — seed the demo catalog to see how the page renders."
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="mb-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="text-sm text-slate-600">{message}</p>
      <form action="/api/products/seed" method="POST" className="mt-4">
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Seed demo products
        </button>
      </form>
    </div>
  );
}
