import { readFileSync } from "node:fs";
import path from "node:path";
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
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Brand Hero Banner with Ambient Glow */}
        <header className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-slate-900/60 p-8 sm:p-12 shadow-2xl backdrop-blur-xl transition hover:border-indigo-500/30">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Engine Online · {dbStatus}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur">
              Meta Graph API v19.0
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3.5 py-1 text-xs font-semibold text-fuchsia-300 backdrop-blur">
              Sub-50ms Response
            </span>
          </div>

          <div className="relative z-10 mt-6 max-w-3xl">
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl text-white">
              AutoFlow <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">IG</span>
              <span className="block mt-2 text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                Instagram Reel & Story DM SaaS
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300">
              Transform your Instagram Comments & Story Mentions into instant sales leads. Create custom Reel campaigns with text keywords & emojis (<code className="text-fuchsia-300 font-mono">majak, 🔥, tool, link</code>) to send dynamic DM responses on Cloudflare Workers edge network.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
              <a
                href="#tester"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 px-6 py-3 text-white shadow-xl shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
              >
                <span>Manage Reel Campaigns →</span>
              </a>
              <a
                href="#nextgen"
                className="rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                View 2026 Features
              </a>
            </div>
          </div>
        </header>

        {/* Live System Metrics */}
        <section id="engine" className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Execution Engine", val: "Cloudflare Worker", detail: "Sub-50ms Response Time" },
            { label: "Database Core", val: "Neon Postgres", detail: "Type-safe Drizzle ORM" },
            { label: "Daily Capacity", val: "100,000 DMs/day", detail: "100% Free Tier Supported" },
            { label: "Security Verification", val: "HMAC-SHA256", detail: "Zod Payload Validation" },
          ].map((m) => (
            <div
              key={m.label}
              className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-xl backdrop-blur-xl transition hover:border-indigo-500/40 hover:bg-slate-900/70"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {m.label}
              </p>
              <p className="mt-2 text-lg sm:text-xl font-black text-white group-hover:text-indigo-300 transition-colors">{m.val}</p>
              <p className="mt-1 text-xs text-indigo-400 font-medium">{m.detail}</p>
            </div>
          ))}
        </section>

        {/* 2026 Next-Gen Automation Capabilities */}
        <section id="nextgen" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                2026 Next-Gen Automation Capabilities
              </h2>
              <p className="text-sm text-slate-400">Built for high-converting Instagram creators and business owners.</p>
            </div>
            <span className="rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 px-3.5 py-1 text-xs font-semibold text-fuchsia-300">
              Meta Graph API v19.0 + AI Intent Ready
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Reel Custom Keyword & Emoji Rules",
                tag: "HIGH CONVERSION",
                desc: "Set custom words like 'majak', 'tool' or emojis 🔥, ❤️ to trigger private DM links automatically.",
              },
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
            ].map((card) => (
              <div
                key={card.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl transition hover:border-indigo-500/50 hover:bg-slate-900/90"
              >
                <span className="inline-block rounded-md bg-indigo-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-indigo-300">
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

        {/* Interactive Reel Campaign Manager & Keyword Tester */}
        <section id="tester" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Reel Campaign Manager & Live Matcher</h2>
              <p className="text-sm text-slate-400">Create custom keyword & emoji DM rules for your Reels or test incoming comments live.</p>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800/90 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl">
            <Tester />
          </div>
        </section>

        {/* Worker Source Inspector */}
        <section id="worker" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Cloudflare Edge Worker Source Inspector</h2>
            <span className="font-mono text-xs text-slate-400">worker/index.js</span>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">`worker/wrangler.toml`</p>
              <pre className="max-h-96 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-4 font-mono text-xs text-slate-300">
                {wranglerToml}
              </pre>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">`worker/index.js`</p>
              <pre className="max-h-96 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-4 font-mono text-xs text-slate-300">
                {workerCode}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  );

}
