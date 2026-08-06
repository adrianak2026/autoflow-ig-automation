import { NextResponse } from "next/server";
import { db, ensureNeonDbMigrated } from "@/db";
import { testRuns } from "@/db/schema";
import { desc } from "drizzle-orm";
import { matchKeyword, renderTemplate, type MatchMode } from "@/lib/matcher";

export const dynamic = "force-dynamic";

const DEFAULT_TEMPLATE =
  "Hey {username}, here is your requested link: https://yourwebsite.com";

// Input length limits to prevent abuse / DoS
const MAX_COMMENT_LEN = 2000;
const MAX_KEYWORDS_LEN = 500;
const MAX_USERNAME_LEN = 100;
const MAX_TEMPLATE_LEN = 2000;

export async function POST(req: Request) {
  await ensureNeonDbMigrated();
  let body: {
    commentText?: string;
    username?: string;
    keywords?: string;
    matchMode?: MatchMode;
    template?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Enforced length limits
  const commentText = (body.commentText ?? "").toString().slice(0, MAX_COMMENT_LEN);
  const username = (body.username ?? "there").toString().trim().slice(0, MAX_USERNAME_LEN) || "there";
  const keywords = (body.keywords ?? "link,info,price").toString().slice(0, MAX_KEYWORDS_LEN);
  const matchMode: MatchMode = body.matchMode === "word" ? "word" : "partial";
  if (Object.prototype.hasOwnProperty.call(body, "matchMode") && matchMode !== body.matchMode) {
    return NextResponse.json({ error: "Invalid match mode. Use 'partial' or 'word'." }, { status: 400 });
  }
  const template = (body.template ?? DEFAULT_TEMPLATE).toString().slice(0, MAX_TEMPLATE_LEN);

  const matched = matchKeyword(commentText, keywords, matchMode);
  const rendered = matched
    ? renderTemplate(template, { username, keyword: matched })
    : null;

  try {
    if (process.env.DATABASE_URL) {
      await db.insert(testRuns).values({
        commentText,
        username,
        keywords,
        matchMode,
        matched: !!matched,
        matchedKeyword: matched,
        renderedMessage: rendered,
      });
    }
  } catch (err) {
    console.warn("[TEST_MATCH] DB log skipped:", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({
    matched: !!matched,
    matchedKeyword: matched,
    renderedMessage: rendered,
    matchMode,
  });
}

export async function GET() {
  try {
    await ensureNeonDbMigrated();
    const rows = await db
      .select()
      .from(testRuns)
      .orderBy(desc(testRuns.createdAt))
      .limit(10);
    return NextResponse.json({ rows });
  } catch (err) {
    console.warn("[TEST_MATCH_GET]", err instanceof Error ? err.message : err);
    return NextResponse.json({ rows: [] });
  }
}
