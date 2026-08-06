import { NextResponse } from "next/server";
import { db, ensureNeonDbMigrated } from "@/db";
import { testRuns } from "@/db/schema";
import { desc } from "drizzle-orm";
import { matchKeyword, renderTemplate, type MatchMode } from "@/lib/matcher";

export const dynamic = "force-dynamic";

const DEFAULT_TEMPLATE =
  "Hey {username}, here is your requested link: https://yourwebsite.com";

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

  const commentText = (body.commentText ?? "").toString();
  const username = (body.username ?? "there").toString().trim() || "there";
  const keywords = (body.keywords ?? "link,info,price").toString();
    const matchMode: MatchMode = body.matchMode === "word" ? "word" : "partial";
    if (Object.prototype.hasOwnProperty.call(body, "matchMode") && matchMode !== body.matchMode) {
      return NextResponse.json({ error: "Invalid match mode" }, { status: 400 });
    }
  const template = (body.template ?? DEFAULT_TEMPLATE).toString();

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
    console.warn("Test match run DB log skipped:", err);
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
    console.warn("Could not fetch testRuns history:", err);
    return NextResponse.json({ rows: [] });
  }
}

