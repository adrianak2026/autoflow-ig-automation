import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoFlow IG — Next-Gen Serverless Instagram DM Automation SaaS Engine",
  description:
    "AutoFlow IG: Enterprise-grade Instagram Comment & Story → DM automation engine running on Cloudflare Workers & Neon Postgres DB.",
};

const NAV = [
  { href: "/#engine", label: "Automation Engine" },
  { href: "/#tester", label: "Interactive Tester" },
  { href: "/#nextgen", label: "2026 Capabilities" },
  { href: "/#worker", label: "Edge Worker Status" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-fuchsia-500 selection:text-white">
        <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-pink-600 font-black text-white shadow-lg shadow-indigo-500/20">
                AF
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">
                AutoFlow <span className="text-fuchsia-400">IG</span>
              </span>
            </Link>
            <nav className="hidden flex-wrap gap-1 text-sm md:flex">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-lg px-3 py-1.5 font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
