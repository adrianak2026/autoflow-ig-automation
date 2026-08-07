import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  uuid,
  pgEnum,
  numeric,
  index,
  customType,
} from "drizzle-orm/pg-core";

/* --------------------------------------------------------------------------
 * Rule 4: Custom BYTEA type for Zlib-compressed large text fields
 * ------------------------------------------------------------------------- */
import zlib from "node:zlib";

export const byteaCompressedText = customType<{ data: string; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
  toDriver(value: string): Buffer {
    if (!value) return Buffer.alloc(0);
    return zlib.deflateSync(Buffer.from(value, "utf-8"));
  },
  fromDriver(value: Buffer): string {
    if (!value || value.length === 0) return "";
    try {
      return zlib.inflateSync(value).toString("utf-8");
    } catch {
      return value.toString("utf-8");
    }
  },
});

/* --------------------------------------------------------------------------
 * Rule 1: PostgreSQL ENUMs instead of repeated text strings
 * ------------------------------------------------------------------------- */
export const userRoleEnum = pgEnum("user_role", ["admin", "user", "partner"]);
export const matchModeEnum = pgEnum("match_mode", ["partial", "word", "any"]);
export const dmStatusEnum = pgEnum("dm_status", ["sent", "failed", "skipped"]);
export const intentCategoryEnum = pgEnum("intent_category", [
  "pricing",
  "support",
  "link_request",
  "general",
]);

/* --------------------------------------------------------------------------
 * AutoFlow IG Schema — Storage-Optimized Postgres Engine
 * ------------------------------------------------------------------------- */

/* ---------------- Users / Brand Owners (Rule 2: Native UUID & Serial PKs) ---------------- */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(), // Native UUID type
    email: text("email").notNull().unique(),
    username: text("username").unique(),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"), // Rule 5: Direct URL only
    instagramPageId: text("instagram_page_id").unique(),
    role: userRoleEnum("role").notNull().default("admin"), // Rule 1: ENUM
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata").default("{}"), // Rule 3: JSONB
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailIdx: index("users_email_idx").on(t.email),
  }),
);

/* ---------------- Automation Campaigns / Rules (Rule 2: Autoincrement PK) ---------------- */
export const automationCampaigns = pgTable(
  "automation_campaigns",
  {
    id: serial("id").primaryKey(), // Rule 2: Integer autoincrement PK for internal tables
    name: text("name").notNull(),
    triggerKeywords: text("trigger_keywords").notNull(), // Comma-separated short keywords
    replyTemplate: byteaCompressedText("reply_template").notNull(), // Rule 4: Zlib compressed
    matchMode: matchModeEnum("match_mode").notNull().default("partial"), // Rule 1: ENUM
    isActive: boolean("is_active").notNull().default(true),
    reelUrl: text("reel_url"),                               // Instagram Reel/Post URL (for display)
    reelMediaId: text("reel_media_id"),                      // Instagram numeric media ID for webhook matching
    totalDmsSent: integer("total_dms_sent").notNull().default(0),
    totalComments: integer("total_comments").notNull().default(0),
    ownerId: uuid("owner_id").references(() => users.id),
    settings: jsonb("settings").default("{}"), // Rule 3: JSONB
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    activeIdx: index("campaigns_active_idx").on(t.isActive),
  }),
);

/* ---------------- IG DM Delivery Logs (Rule 2: Autoincrement PK & Compressed Raw Logs) ---------------- */
export const igDmLogs = pgTable(
  "ig_dm_logs",
  {
    id: serial("id").primaryKey(), // Rule 2: Integer autoincrement PK
    commentId: text("comment_id").notNull(),
    igUsername: text("ig_username").notNull(),
    commentText: byteaCompressedText("comment_text").notNull(), // Rule 4: Zlib compressed
    matchedKeyword: text("matched_keyword"),
    dmStatus: dmStatusEnum("dm_status").notNull().default("sent"), // Rule 1: ENUM
    campaignId: integer("campaign_id").references(() => automationCampaigns.id),
    errorMessage: byteaCompressedText("error_message"), // Rule 4: Zlib compressed
    metadata: jsonb("metadata").default("{}"), // Rule 3: JSONB
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    commentIdx: index("dm_logs_comment_idx").on(t.commentId),
    statusIdx: index("dm_logs_status_idx").on(t.dmStatus),
    createdIdx: index("dm_logs_created_idx").on(t.createdAt),
  }),
);

/* ---------------- System / Environment Settings (Rule 3: JSONB Storage) ---------------- */
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(), // Rule 2: Integer autoincrement PK
  key: text("key").notNull().unique(),
  valueJson: jsonb("value_json").notNull().default("{}"), // Rule 3: JSONB
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------------- Story Mention Automation ---------------- */
export const storyTriggers = pgTable("story_triggers", {
  id: serial("id").primaryKey(), // Rule 2: Integer autoincrement PK
  triggerName: text("trigger_name").notNull(),
  storyKeyword: text("story_keyword"),
  dmReplyTemplate: byteaCompressedText("dm_reply_template").notNull(), // Rule 4: Zlib compressed
  ctaButtonUrl: text("cta_button_url"), // Rule 5: URL only
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------------- AI Sentiment & Smart Auto-Reply ---------------- */
export const aiAutoReplies = pgTable("ai_auto_replies", {
  id: serial("id").primaryKey(), // Rule 2: Integer autoincrement PK
  intentCategory: intentCategoryEnum("intent_category").notNull(), // Rule 1: ENUM
  fallbackDmTemplate: byteaCompressedText("fallback_dm_template").notNull(), // Rule 4: Zlib compressed
  aiPromptInstructions: byteaCompressedText("ai_prompt_instructions"), // Rule 4: Zlib compressed
  confidenceScore: numeric("confidence_score", { precision: 3, scale: 2 }).default("0.85"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------------- Multi-Variant DM Sequence (Spintax) ---------------- */
export const messageVariants = pgTable("message_variants", {
  id: serial("id").primaryKey(), // Rule 2: Integer autoincrement PK
  campaignId: integer("campaign_id").references(() => automationCampaigns.id),
  variantText: byteaCompressedText("variant_text").notNull(), // Rule 4: Zlib compressed
  buttonTitle: text("button_title"),
  buttonUrl: text("button_url"), // Rule 5: URL only
  sendWeight: integer("send_weight").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------------- Captured Leads & Subscribers ---------------- */
export const leadSubscribers = pgTable("lead_subscribers", {
  id: serial("id").primaryKey(), // Rule 2: Integer autoincrement PK
  instagramUsername: text("instagram_username").notNull().unique(),
  capturedEmail: text("captured_email"),
  sourceCampaign: text("source_campaign"),
  metadata: jsonb("metadata").default("{}"), // Rule 3: JSONB
  engagementCount: integer("engagement_count").notNull().default(1),
  lastEngagedAt: timestamp("last_engaged_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------------- IG Keyword Test Runs ---------------- */
export const testRuns = pgTable("test_runs", {
  id: serial("id").primaryKey(),
  commentText: text("comment_text").notNull(),
  username: text("username").notNull().default("there"),
  keywords: text("keywords").notNull(),
  matchMode: matchModeEnum("match_mode").notNull().default("partial"), // Rule 1: ENUM
  matched: boolean("matched").notNull().default(false),
  matchedKeyword: text("matched_keyword"),
  renderedMessage: text("rendered_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
