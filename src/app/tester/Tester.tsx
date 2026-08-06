"use client";

import { useEffect, useState } from "react";

type Campaign = {
  id: number;
  name: string;
  triggerKeywords: string;
  replyTemplate: string;
  matchMode: string;
  isActive: boolean;
  totalDmsSent: number;
  createdAt: string;
};

type StoryTrigger = {
  id: number;
  triggerName: string;
  storyKeyword: string | null;
  dmReplyTemplate: string;
  ctaButtonUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

type LeadSubscriber = {
  id: number;
  instagramUsername: string;
  capturedEmail: string | null;
  sourceCampaign: string | null;
  engagementCount: number;
  lastEngagedAt: string;
};

type TestRow = {
  id: number;
  commentText: string;
  username: string;
  keywords: string;
  matchMode: string;
  matched: boolean;
  matchedKeyword: string | null;
  renderedMessage: string | null;
  createdAt: string;
};

type TestResult = {
  matched: boolean;
  matchedKeyword: string | null;
  renderedMessage: string | null;
};

export default function Tester() {
  const [activeTab, setActiveTab] = useState<"builder" | "story" | "leads" | "tester">("builder");

  // Admin Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState("admin");
  const [authPass, setAuthPass] = useState("");
  const [authError, setAuthError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Campaign Builder State (Reels)
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [cName, setCName] = useState("");
  const [cKeywords, setCKeywords] = useState("majak,🔥,tool,link");
  const [cTemplate, setCTemplate] = useState("Hey {username}! Reel me bataya gaya tool link: https://yourwebsite.com/tool");

  const [cMatchMode, setCMatchMode] = useState<"partial" | "word">("partial");
  const [saving, setSaving] = useState(false);

  // Story DM Triggers State
  const [stories, setStories] = useState<StoryTrigger[]>([]);
  const [stName, setStName] = useState("");
  const [stKeyword, setStKeyword] = useState("reward, discount, VIP");
  const [stTemplate, setStTemplate] = useState("Thanks for tagging us in your Instagram Story! Here is your exclusive reward: https://yourwebsite.com/vip");
  const [stCtaUrl, setStCtaUrl] = useState("https://yourwebsite.com/vip");
  const [stSaving, setStSaving] = useState(false);

  // Leads State
  const [leads, setLeads] = useState<LeadSubscriber[]>([]);

  // Tester State
  const [commentText, setCommentText] = useState("Bhai majak mat kar 🔥 tool send kar");
  const [username, setUsername] = useState("alex");
  const [keywords, setKeywords] = useState("majak,🔥,tool,link");
  const [matchMode, setMatchMode] = useState<"partial" | "word">("partial");
  const [template, setTemplate] = useState(
    "Hey {username}, here is your requested link: https://yourwebsite.com/tool",
  );
  const [result, setResult] = useState<TestResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<TestRow[]>([]);

  async function loadCampaigns() {
    try {
      const r = await fetch("/api/campaigns");
      const j = await r.json();
      setCampaigns(j.campaigns || []);
    } catch {
      /* noop */
    }
  }

  async function loadExtraFeatures() {
    try {
      const r = await fetch("/api/features");
      const j = await r.json();
      setStories(j.stories || []);
      setLeads(j.leads || []);
    } catch {
      /* noop */
    }
  }

  async function loadHistory() {
    try {
      const r = await fetch("/api/test-match", { cache: "no-store" });
      const j = (await r.json()) as { rows: TestRow[] };
      setRows(j.rows || []);
    } catch {
      /* noop */
    }
  }

  useEffect(() => {
    loadCampaigns();
    loadExtraFeatures();
    loadHistory();
  }, []);

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!cName.trim() || !cKeywords.trim() || !cTemplate.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/campaigns", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: cName,
          triggerKeywords: cKeywords,
          replyTemplate: cTemplate,
          matchMode: cMatchMode,
        }),
      });
      setCName("");
      loadCampaigns();
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateStoryTrigger(e: React.FormEvent) {
    e.preventDefault();
    if (!stName.trim() || !stTemplate.trim()) return;
    setStSaving(true);
    try {
      await fetch("/api/features", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "create_story",
          triggerName: stName,
          storyKeyword: stKeyword,
          dmReplyTemplate: stTemplate,
          ctaButtonUrl: stCtaUrl,
        }),
      });
      setStName("");
      loadExtraFeatures();
    } finally {
      setStSaving(false);
    }
  }

  async function handleDeleteCampaign(id: number) {
    try {
      await fetch(`/api/campaigns?id=${id}`, { method: "DELETE" });
      loadCampaigns();
    } catch {
      /* noop */
    }
  }

  async function runTest() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/test-match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          commentText,
          username,
          keywords,
          matchMode,
          template,
        }),
      });
      const data = (await res.json()) as TestResult;
      setResult(data);
      loadHistory();
    } catch {
      /* noop */
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: authUser, password: authPass }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setAuthError(data.error || "Invalid username or password");
      }
    } catch {
      setAuthError("Login failed. Check server status.");
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Admin Authentication Security Banner */}
      {!isAuthenticated && (
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">🔒 Protected Owner Workspace</span>
              </div>
              <h3 className="mt-1 text-lg font-extrabold text-white">Admin Credentials Verification Required</h3>
              <p className="text-xs text-slate-400">Enter your Admin Secret Password to create, edit, or delete Reel rules & story triggers.</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={authUser}
                onChange={(e) => setAuthUser(e.target.value)}
                placeholder="Admin Username"
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                required
              />
              <input
                type="password"
                value={authPass}
                onChange={(e) => setAuthPass(e.target.value)}
                placeholder="Secret Password"
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={loggingIn}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {loggingIn ? "Verifying..." : "🔑 Unlock Admin Access"}
              </button>
            </form>
          </div>
          {authError && <p className="mt-2 text-xs font-bold text-rose-400">⚠️ {authError}</p>}
        </div>
      )}

      {/* Navigation Tabs */}

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("builder")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
            activeTab === "builder"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span>🎬 Reel Custom Rules</span>
          <span className="rounded-full bg-indigo-400/20 px-2 py-0.5 text-[10px] text-indigo-300 font-bold">
            {campaigns.length} Saved in Neon DB
          </span>
        </button>

        <button
          onClick={() => setActiveTab("story")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
            activeTab === "story"
              ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/30"
              : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span>📸 Story Mention DM Auto-Reply</span>
          <span className="rounded-full bg-fuchsia-400/20 px-2 py-0.5 text-[10px] text-fuchsia-300 font-bold">
            {stories.length} Rules
          </span>
        </button>

        <button
          onClick={() => setActiveTab("leads")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
            activeTab === "leads"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span>👥 Captured Leads DB</span>
          <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] text-emerald-300 font-bold">
            Neon DB
          </span>
        </button>

        <button
          onClick={() => setActiveTab("tester")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
            activeTab === "tester"
              ? "bg-slate-700 text-white shadow-lg"
              : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span>⚡ Live Match Tester</span>
        </button>
      </div>

      {/* TAB 1: Reel Campaign Creator (Saved in Neon DB) */}
      {activeTab === "builder" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Create Form */}
          <form onSubmit={handleCreateCampaign} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>➕ Add New Reel Auto DM Rule</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Saves in Neon DB
              </span>
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Reel / Campaign Name
              </label>
              <input
                type="text"
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                placeholder="e.g. AI Video Tool Reel #12"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Trigger Keywords & Emojis (Comma Separated)
              </label>
              <input
                type="text"
                value={cKeywords}
                onChange={(e) => setCKeywords(e.target.value)}
                placeholder="majak, 🔥, tool, link, ❤️, send"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm font-mono text-indigo-300 focus:border-indigo-500 focus:outline-none"
                required
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Put custom words or emojis (e.g. <code className="text-fuchsia-300">majak, 🔥, tool, link</code>). Anyone commenting these gets the DM.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Auto DM Message & Dynamic Link
              </label>
              <textarea
                rows={3}
                value={cTemplate}
                onChange={(e) => setCTemplate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                required
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Use <code className="text-indigo-300">&#123;username&#125;</code> and <code className="text-indigo-300">&#123;keyword&#125;</code> variables.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving to Neon DB..." : "💾 Save Rule in Neon DB"}
            </button>
          </form>

          {/* Active Campaigns Saved in Neon DB */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Active Reel Rules in Neon DB ({campaigns.length})</span>
              <span className="text-[10px] text-indigo-400 font-mono">Table: automation_campaigns</span>
            </h3>
            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {campaigns.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-400">
                  No custom Reel rules created yet. Fill the form to add unlimited triggers to Neon DB!
                </div>
              )}
              {campaigns.map((c) => (
                <div key={c.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-slate-700">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{c.name}</h4>
                    <button
                      onClick={() => handleDeleteCampaign(c.id)}
                      className="rounded-lg bg-rose-500/10 px-2 py-1 text-[11px] font-semibold text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.triggerKeywords.split(",").map((kw, i) => (
                      <span key={i} className="rounded-md bg-indigo-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-300 border border-indigo-500/20">
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs italic text-slate-300 line-clamp-2">
                    “{c.replyTemplate}”
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Story Mention DM Auto-Reply Rules */}
      {activeTab === "story" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleCreateStoryTrigger} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">📸 Add Story Mention Reward Rule</h3>
              <span className="text-[10px] font-mono font-bold text-fuchsia-400 border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 rounded-full">
                Story Auto-DM
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Trigger Rule Name</label>
              <input
                type="text"
                value={stName}
                onChange={(e) => setStName(e.target.value)}
                placeholder="e.g. VIP Story Tag Reward"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-fuchsia-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">DM Reward Message</label>
              <textarea
                rows={3}
                value={stTemplate}
                onChange={(e) => setStTemplate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-fuchsia-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">CTA Link Button URL</label>
              <input
                type="url"
                value={stCtaUrl}
                onChange={(e) => setStCtaUrl(e.target.value)}
                placeholder="https://yourwebsite.com/reward"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-fuchsia-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={stSaving}
              className="w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50"
            >
              {stSaving ? "Saving to Neon DB..." : "💾 Save Story Rule in Neon DB"}
            </button>
          </form>

          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Story Mention Rules in Neon DB ({stories.length})</span>
              <span className="text-[10px] text-fuchsia-400 font-mono">Table: story_triggers</span>
            </h3>
            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {stories.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-400">
                  No Story mention rules created yet. Anyone tagging you in Stories gets instant DM rewards!
                </div>
              )}
              {stories.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <h4 className="text-sm font-bold text-white">{s.triggerName}</h4>
                  <p className="mt-2 text-xs italic text-slate-300">“{s.dmReplyTemplate}”</p>
                  {s.ctaButtonUrl && (
                    <span className="mt-2 inline-block text-[11px] text-fuchsia-300 underline font-mono">
                      CTA: {s.ctaButtonUrl}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Captured Leads DB */}
      {activeTab === "leads" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">👥 Auto-Captured Leads & Subscribers</h3>
              <p className="text-xs text-slate-400">Automated Instagram users & engagement history logged in Neon Postgres DB.</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 rounded-full font-bold">
              Neon DB Table: lead_subscribers
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                <tr>
                  <th className="py-3 px-4">IG Username</th>
                  <th className="py-3 px-4">Captured Email</th>
                  <th className="py-3 px-4">Source Reel Campaign</th>
                  <th className="py-3 px-4">Engagements</th>
                  <th className="py-3 px-4">Last Engaged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No leads captured yet. As users comment on Reels, their info gets logged into Neon DB automatically!
                    </td>
                  </tr>
                )}
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-white">@{l.instagramUsername}</td>
                    <td className="py-3 px-4 text-indigo-300 font-mono">{l.capturedEmail || "—"}</td>
                    <td className="py-3 px-4">{l.sourceCampaign || "Reel Comment Auto DM"}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">{l.engagementCount}x</td>
                    <td className="py-3 px-4 text-slate-400">{new Date(l.lastEngagedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Live Tester */}
      {activeTab === "tester" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Simulated Comment
              </label>
              <textarea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400">
                  Commenter Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400">
                  Match Mode
                </label>
                <select
                  value={matchMode}
                  onChange={(e) =>
                    setMatchMode(e.target.value as "partial" | "word")
                  }
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="partial">partial (substring)</option>
                  <option value="word">word (exact token)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Keywords & Emojis to Test
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-mono text-indigo-300 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                DM Template
              </label>
              <input
                type="text"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              onClick={runTest}
              disabled={busy}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {busy ? "Running Matcher..." : "Run Keyword Match"}
            </button>

            {result && (
              <div
                className={`rounded-xl border p-4 text-sm ${
                  result.matched
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                }`}
              >
                <p className="font-semibold">
                  {result.matched
                    ? `Matched keyword: "${result.matchedKeyword}"`
                    : "No keyword matched — no DM would be sent."}
                </p>
                {result.renderedMessage && (
                  <p className="mt-2">
                    <span className="font-medium">Rendered DM:</span>{" "}
                    <span className="italic">{result.renderedMessage}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* History */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Recent Automation Runs (Neon Postgres)
            </h3>
            <ul className="mt-3 divide-y divide-slate-800">
              {rows.length === 0 && (
                <li className="py-6 text-sm text-slate-400">
                  No test runs yet — run one on the left.
                </li>
              )}
              {rows.map((r) => (
                <li key={r.id} className="py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-slate-200">
                      “{r.commentText}”
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        r.matched
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {r.matched ? r.matchedKeyword : "no match"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    @{r.username} · {r.matchMode} · {new Date(r.createdAt).toLocaleString()}
                  </div>
                  {r.renderedMessage && (
                    <div className="mt-1 text-xs italic text-indigo-300">
                      → {r.renderedMessage}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
