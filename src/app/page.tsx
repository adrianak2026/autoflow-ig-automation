import { readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import Tester from "./tester/Tester";

export const dynamic = "force-dynamic";

function readWorkerFile(rel: string) {
  try {
    return readFileSync(path.join(process.cwd(), "worker", rel), "utf8");
  } catch {
    return "// (file not found)";
  }
}

export default async function HomePage() {
  let dbStatus = "Connected (Neon Postgres)";
  try {
    await db.execute(sql`select 1`);
  } catch {
    dbStatus = "Offline / Connection Error";
  }

  const workerCode = readWorkerFile("index.js");
  const wranglerToml = readWorkerFile("wrangler.toml");

  return (
    <main className="min-h-screen px-6 py-10 bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Brand Banner */}
        <header className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950 via-slate-900 to-fuchsia-950 p-10 shadow-2xl shadow-indigo-950/50">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online · {dbStatus}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              Meta Graph API v19.0
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl text-white">
            AutoFlow <span className="text-fuchsia-400">IG</span> <br />
            <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Automation SaaS Engine
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-base text-slate-300">
            AutoFlow IG is an ultra-fast, serverless Instagram DM automation platform running on Cloudflare Workers & Neon Postgres DB. Zero monthly SaaS fees, sub-second reply speed, and enterprise security.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
            <a
              href="#tester"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-3 text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 transition"
            >
              Test Automation Keywords →
            </a>
            <a
              href="#worker"
              className="rounded-xl border border-slate-800 bg-slate-900/80 px-5 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              View Worker Code
            </a>
          </div>
        </header>

        {/* Live System Metrics */}
        <section id="engine" className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Execution Engine", val: "Cloudflare Worker", detail: "Sub-50ms Response Time" },
            { label: "Database Core", val: "Neon Postgres", detail: "Type-safe Drizzle ORM" },
            { label: "Daily Capacity", val: "100,000 DMs/day", detail: "100% Free Tier Supported" },
            { label: "Security Verification", val: "HMAC-SHA256", detail: "Zod Payload Validation" },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-xl backdrop-blur"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {m.label}
              </p>
              <p className="mt-2 text-xl font-bold text-white">{m.val}</p>
              <p className="mt-1 text-xs text-indigo-400">{m.detail}</p>
            </div>
          ))}
        </section>

        {/* 2026 Next-Gen Automation Capabilities */}
        <section id="nextgen" className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              2026 Next-Gen Automation Features
            </h2>
            <span className="rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 px-3 py-1 text-xs font-semibold text-fuchsia-300">
              Meta Graph API v19.0 + AI Intent Ready
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Story Mention DM Auto-Reply",
                tag: "NEW IN 2026",
                desc: "Detects when users mention your brand in their Instagram Stories & sends instant private DM rewards.",
              },
              {
                title: "AI Sentiment & Intent Reply",
                tag: "SMART AI",
                desc: "Classifies user comment intent (Pricing vs Support vs Link) to dispatch context-aware custom replies.",
              },
              {
                title: "Multi-Variant Spintax DMs",
                tag: "ANTI-SPAM",
                desc: "Rotates dynamic DM variations & dynamic button URLs to prevent Meta spam detection filters.",
              },
              {
                title: "Auto Lead Capture DB",
                tag: "NEON POSTGRES",
                desc: "Automatically extracts IG usernames, engagement history & captured emails straight into Neon DB.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur transition hover:border-indigo-500/50 hover:bg-slate-900/90"
              >
                <span className="inline-block rounded-md bg-indigo-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-300">
                  {card.tag}
                </span>
                <h3 className="mt-3 text-base font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                  {card.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

                  <code>IG_ACCESS_TOKEN</code>.
                </li>
                <li>
                  For signature verification, copy your App&apos;s secret into{" "}
                  <code>WEBHOOK_APP_SECRET</code>.
                </li>
              </ol>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Environment variables</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Kind</th>
                    <th className="py-2">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2 pr-4 font-mono">VERIFY_TOKEN</td>
                    <td className="py-2 pr-4">secret</td>
                    <td className="py-2">Meta webhook verification token.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">IG_ACCESS_TOKEN</td>
                    <td className="py-2 pr-4">secret</td>
                    <td className="py-2">Long-lived Page/IG token for Graph API calls.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">WEBHOOK_APP_SECRET</td>
                    <td className="py-2 pr-4">secret</td>
                    <td className="py-2">Meta App secret — used to verify X-Hub-Signature-256.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">DATABASE_URL</td>
                    <td className="py-2 pr-4">secret (Next.js)</td>
                    <td className="py-2">Postgres connection string for the dashboard (NOT the worker).</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">KEYWORDS</td>
                    <td className="py-2 pr-4">var</td>
                    <td className="py-2">Comma-separated keywords — <code>link,info,price,buy,deal</code>.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">REPLY_TEMPLATE</td>
                    <td className="py-2 pr-4">var</td>
                    <td className="py-2">DM body with <code>{`{username}`}</code> / <code>{`{keyword}`}</code>.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">MATCH_MODE</td>
                    <td className="py-2 pr-4">var</td>
                    <td className="py-2"><code>partial</code> or <code>word</code>.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">IG_PAGE_ID</td>
                    <td className="py-2 pr-4">var (optional)</td>
                    <td className="py-2">Enables self-comment filtering.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">RATE_LIMIT_WINDOW_MS</td>
                    <td className="py-2 pr-4">var</td>
                    <td className="py-2">Rate-limit window (default 60000 ms).</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">RATE_LIMIT_MAX_REQUESTS</td>
                    <td className="py-2 pr-4">var</td>
                    <td className="py-2">Max requests per IP per window (default 120).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Tester */}
        <section id="tester" className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Interactive matcher tester</h2>
          <p className="text-sm text-slate-600">
            Runs the same matching + template logic as the Worker, then persists each run
            to Postgres so you can audit what would have been sent.
          </p>
          <Tester />
        </section>

        {/* Worker code */}
        <section id="worker" className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">worker/index.js</h2>
          <p className="text-sm text-slate-600">
            The complete hardened Worker — Zod + HMAC + KV rate-limit + compression +
            security headers.
          </p>
          <pre className="max-h-[600px] overflow-auto rounded-2xl bg-slate-900 p-6 font-mono text-xs leading-relaxed text-slate-100 shadow-inner">
            <code>{workerCode}</code>
          </pre>

          <h2 className="pt-4 text-2xl font-bold text-slate-900">worker/wrangler.toml</h2>
          <pre className="overflow-auto rounded-2xl bg-slate-900 p-6 font-mono text-xs leading-relaxed text-slate-100 shadow-inner">
            <code>{wranglerToml}</code>
          </pre>
        </section>

        <footer className="border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          KoshVerse · Cloudflare Workers (IG bot) + Next.js + Drizzle + Postgres.
        </footer>
      </div>
    </main>
  );
}
