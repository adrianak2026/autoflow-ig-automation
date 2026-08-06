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
  const [activeTab, setActiveTab] = useState<"builder" | "tester">("builder");

  // Campaign Builder State
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [cName, setCName] = useState("");
  const [cKeywords, setCKeywords] = useState("majak,🔥,tool,link");
  const [cTemplate, setCTemplate] = useState("Hey {username}! Reel me bataya gaya tool link: https://yourwebsite.com/tool");
  const [cMatchMode, setCMatchMode] = useState<"partial" | "word">("partial");
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("builder")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "builder"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span>🎬 Reel Campaign Manager</span>
          <span className="rounded-full bg-indigo-400/20 px-2 py-0.5 text-xs text-indigo-300">
            {campaigns.length} Active
          </span>
        </button>
        <button
          onClick={() => setActiveTab("tester")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "tester"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span>⚡ Live Match Tester</span>
        </button>
      </div>

      {/* TAB 1: Reel Campaign Creator */}
      {activeTab === "builder" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Create Form */}
          <form onSubmit={handleCreateCampaign} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>➕ Add New Reel Auto DM Rule</span>
            </h3>
            
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
              {saving ? "Saving Campaign..." : "🚀 Save Reel DM Automation Rule"}
            </button>
          </form>

          {/* Active Campaigns List */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Active Reel Rules ({campaigns.length})
            </h3>
            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {campaigns.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-400">
                  No custom Reel rules created yet. Fill the form to add unlimited triggers!
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

      {/* TAB 2: Live Tester */}
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
