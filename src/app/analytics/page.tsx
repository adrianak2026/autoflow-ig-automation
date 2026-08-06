import { db } from "@/db";
import { analyticsEvents, orders, products } from "@/db/schema";
import { sql, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [
    [orderTotal],
    [productTotal],
    [eventTotal],
  ] = await Promise.all([
    db.select({ value: count() }).from(orders),
    db.select({ value: count() }).from(products),
    db.select({ value: count() }).from(analyticsEvents),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
          KoshVerse · Ops
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Analytics & audit trail
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Every IG webhook event the Worker receives is logged to Cloudflare KV, then
          synced into Postgres via a periodic cron trigger for durable analytics.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Products" value={productTotal.value} />
        <StatCard label="Orders" value={orderTotal.value} />
        <StatCard label="Analytics events" value={eventTotal.value} />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Event pipeline
        </h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>
            Instagram sends a webhook to{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">/webhook</code>.
          </li>
          <li>
            Worker verifies HMAC + rate-limits + Zod-validates + matches keywords.
          </li>
          <li>
            Matched (and unmatched) events are pushed to{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">KOSH_KV</code> with a 7-day TTL.
          </li>
          <li>
            A Cloudflare Cron Trigger reads recent KV entries and inserts them into the{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">analytics_events</code> table.
          </li>
          <li>This dashboard reads from that table for ops review.</li>
        </ol>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Drizzle tables</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            {
              name: "users",
              cols: "id, email, username, instagramId, role, isActive, metadata",
            },
            {
              name: "products",
              cols:
                "id, slug, title, type, price, cashbackPct, affiliateUrl, assetKey, isPublished, ownerId",
            },
            {
              name: "orders",
              cols:
                "id, userId, productId, status, amount, currency, cashbackAmount, paymentRef",
            },
            {
              name: "analytics_events",
              cols: "id, eventName, userId, sessionId, source, payload, country",
            },
            {
              name: "test_runs",
              cols: "id, commentText, username, keywords, matchMode, matchedKeyword, renderedMessage",
            },
          ].map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="font-mono text-sm font-semibold text-indigo-700">
                {t.name}
              </p>
              <p className="mt-1 text-xs text-slate-600">{t.cols}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
