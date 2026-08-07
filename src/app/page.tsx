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
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050510] to-black text-slate-100 selection:bg-fuchsia-500/30 selection:text-white px-4 py-8 sm:px-8 sm:py-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none blur-3xl" />
      
      <div className="mx-auto max-w-7xl space-y-12 relative z-10">
        {/* Brand Hero Banner with Ambient Glow */}
        <header className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/5 p-8 sm:p-12 shadow-[0_0_80px_-20px_rgba(79,70,229,0.15)] backdrop-blur-2xl transition-all hover:border-indigo-500/30 hover:shadow-[0_0_100px_-20px_rgba(79,70,229,0.25)]">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px]" />
          <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-[100px]" />

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

            <div className="mt-8 flex flex-wrap gap-4 text-sm font-bold">
              <a
                href="#tester"
                className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-8 py-3.5 text-white shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_60px_-15px_rgba(168,85,247,0.6)]"
              >
                <span>Manage Reel Campaigns</span>
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
              </a>
              <a
                href="#nextgen"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-3.5 text-slate-300 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
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
              className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:bg-white/10 hover:shadow-[0_8px_40px_rgba(79,70,229,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <p className="relative z-10 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {m.label}
              </p>
              <p className="relative z-10 mt-3 text-xl sm:text-2xl font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-fuchsia-400 transition-all">{m.val}</p>
              <p className="relative z-10 mt-1.5 text-xs text-indigo-400/80 font-medium">{m.detail}</p>
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
                color: "indigo"
              },
              {
                title: "Story Mention DM Auto-Reply",
                tag: "NEW IN 2026",
                desc: "Detects when users mention your brand in their Instagram Stories & sends instant private DM rewards.",
                color: "fuchsia"
              },
              {
                title: "AI Sentiment & Intent Reply",
                tag: "SMART AI",
                desc: "Classifies user comment intent (Pricing vs Support vs Link) to dispatch context-aware custom replies.",
                color: "emerald"
              },
              {
                title: "Multi-Variant Spintax DMs",
                tag: "ANTI-SPAM",
                desc: "Rotates dynamic DM variations & dynamic button URLs to prevent Meta spam detection filters.",
                color: "amber"
              },
            ].map((card) => (
              <div
                key={card.title}
                className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/10 hover:shadow-2xl"
              >
                <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-${card.color}-500/10 blur-3xl transition-opacity opacity-50 group-hover:opacity-100`} />
                <span className={`relative z-10 inline-block rounded-lg bg-${card.color}-500/10 border border-${card.color}-500/20 px-3 py-1 font-mono text-[10px] font-bold text-${card.color}-400`}>
                  {card.tag}
                </span>
                <h3 className={`relative z-10 mt-4 text-base font-bold text-white group-hover:text-${card.color}-300 transition-colors`}>
                  {card.title}
                </h3>
                <p className="relative z-10 mt-2 text-xs leading-relaxed text-slate-400">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Reel Campaign Manager & Keyword Tester */}
        <section id="tester" className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Reel Campaign Manager</h2>
              <p className="text-sm text-slate-400 mt-1">Create custom keyword & emoji DM rules for your Reels or test incoming comments live.</p>
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-white/5 bg-[#0a0a0f]/80 p-2 sm:p-4 shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-[2.5rem] pointer-events-none" />
            <div className="relative z-10">
              <Tester />
            </div>
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
