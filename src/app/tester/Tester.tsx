"use client";

import { useEffect, useState } from "react";

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
  const [commentText, setCommentText] = useState("Please send the link!");
  const [username, setUsername] = useState("alex");
  const [keywords, setKeywords] = useState("link,info,price");
  const [matchMode, setMatchMode] = useState<"partial" | "word">("partial");
  const [template, setTemplate] = useState(
    "Hey {username}, here is your requested link: https://yourwebsite.com",
  );
  const [result, setResult] = useState<TestResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<TestRow[]>([]);

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
    loadHistory();
  }, []);

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
      const j = (await res.json()) as { matched: boolean; matchedKeyword: string | null; renderedMessage: string | null; matchMode?: "partial" | "word" };
      setResult({ matched: j.matched, matchedKeyword: j.matchedKeyword, renderedMessage: j.renderedMessage });
      if (j.matchMode === "partial" || j.matchMode === "word") {
        setMatchMode(j.matchMode);
      }
      loadHistory();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Simulated comment
          </label>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Commenter username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Match mode
            </label>
            <select
              value={matchMode}
              onChange={(e) =>
                setMatchMode(e.target.value === "word" ? "word" : "partial")
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="partial">partial (substring)</option>
              <option value="word">word (whole-word)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Keywords (comma-separated)
          </label>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            DM template — use {"{username}"} and {"{keyword}"}
          </label>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <button
          onClick={runTest}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {busy ? "Testing..." : "Run keyword match"}
        </button>

        {result && (
          <div
            className={`rounded-lg border p-4 text-sm ${
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
  );
}
