// Mirror of the Worker's keyword matcher — kept in sync so the dashboard
// tester behaves identically to production.

export type MatchMode = "partial" | "word" | "any";

export function parseKeywords(raw: string): string[] {
  return raw
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function matchKeyword(
  text: string,
  keywordsCsv: string,
  mode: MatchMode = "partial",
): string | null {
  // "any" mode — every comment triggers a DM, no keyword check needed
  if (mode === "any") return "__any__";

  const haystack = String(text || "").toLowerCase();
  const keywords = parseKeywords(keywordsCsv);
  for (const kw of keywords) {
    if (mode === "word") {
      const re = new RegExp(
        `(^|[^\\p{L}\\p{N}_])${escapeRegex(kw)}([^\\p{L}\\p{N}_]|$)`,
        "iu",
      );
      if (re.test(haystack)) return kw;
    } else if (haystack.includes(kw)) {
      return kw;
    }
  }
  return null;
}

export function renderTemplate(
  tpl: string,
  vars: Record<string, string>,
): string {
  return String(tpl).replace(/\{(\w+)\}/g, (_, k: string) =>
    Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : `{${k}}`,
  );
}
