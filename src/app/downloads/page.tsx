import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { EmptyState } from "../cashback/page";

export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  const rows = await db
    .select()
    .from(products)
    .where(
      and(eq(products.type, "digital_download"), eq(products.isPublished, true)),
    )
    .orderBy(products.createdAt);

  const isEmpty = rows.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
          KoshVerse · Assets
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Digital downloads
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Templates, presets, and guides — delivered via short-lived signed URLs after a
          confirmed order.
        </p>
      </header>

      {isEmpty && (
        <EmptyState message="No digital assets yet — seed the demo catalog to see the layout." />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => (
          <div
            key={p.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-900">{p.title}</h3>
                <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-700">
                  digital
                </span>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                {p.description}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-lg font-bold text-slate-900">
                {Number(p.price).toLocaleString("en-IN", {
                  style: "currency",
                  currency: p.currency || "INR",
                  maximumFractionDigits: 0,
                })}
              </p>
              <button className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
