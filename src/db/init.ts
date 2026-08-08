import { sql } from "drizzle-orm";
import { db } from "./index";

export async function runDatabaseInit() {
  const queries = [
    // ENUM Types
    `DO $$ BEGIN CREATE TYPE "user_role" AS ENUM('admin', 'user', 'partner'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "match_mode" AS ENUM('partial', 'word', 'any'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "dm_status" AS ENUM('sent', 'failed', 'skipped'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "intent_category" AS ENUM('pricing', 'support', 'link_request', 'general'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,

    // Tables
    `CREATE TABLE IF NOT EXISTS "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "email" text NOT NULL,
      "username" text,
      "display_name" text,
      "avatar_url" text,
      "instagram_page_id" text,
      "role" "user_role" DEFAULT 'admin' NOT NULL,
      "is_active" boolean DEFAULT true NOT NULL,
      "metadata" jsonb DEFAULT '{}'::jsonb,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "users_email_unique" UNIQUE("email"),
      CONSTRAINT "users_username_unique" UNIQUE("username"),
      CONSTRAINT "users_instagram_page_id_unique" UNIQUE("instagram_page_id")
    );`,

    `CREATE TABLE IF NOT EXISTS "automation_campaigns" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "trigger_keywords" text NOT NULL,
      "reply_template" bytea NOT NULL,
      "match_mode" "match_mode" DEFAULT 'partial' NOT NULL,
      "is_active" boolean DEFAULT true NOT NULL,
      "reel_url" text,
      "reel_media_id" text,
      "total_dms_sent" integer DEFAULT 0 NOT NULL,
      "total_comments" integer DEFAULT 0 NOT NULL,
      "owner_id" uuid REFERENCES "users"("id") ON DELETE no action ON UPDATE no action,
      "settings" jsonb DEFAULT '{}'::jsonb,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "ig_dm_logs" (
      "id" serial PRIMARY KEY NOT NULL,
      "comment_id" text NOT NULL,
      "ig_username" text NOT NULL,
      "comment_text" bytea NOT NULL,
      "matched_keyword" text,
      "dm_status" "dm_status" DEFAULT 'sent' NOT NULL,
      "campaign_id" integer REFERENCES "automation_campaigns"("id") ON DELETE no action ON UPDATE no action,
      "error_message" bytea,
      "metadata" jsonb DEFAULT '{}'::jsonb,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "system_settings" (
      "id" serial PRIMARY KEY NOT NULL,
      "key" text NOT NULL,
      "value_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
      "description" text,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "system_settings_key_unique" UNIQUE("key")
    );`,

    `CREATE TABLE IF NOT EXISTS "story_triggers" (
      "id" serial PRIMARY KEY NOT NULL,
      "trigger_name" text NOT NULL,
      "story_keyword" text,
      "dm_reply_template" bytea NOT NULL,
      "cta_button_url" text,
      "is_active" boolean DEFAULT true NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "ai_auto_replies" (
      "id" serial PRIMARY KEY NOT NULL,
      "intent_category" "intent_category" NOT NULL,
      "fallback_dm_template" bytea NOT NULL,
      "ai_prompt_instructions" bytea,
      "confidence_score" numeric(3, 2) DEFAULT '0.85',
      "is_enabled" boolean DEFAULT true NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "message_variants" (
      "id" serial PRIMARY KEY NOT NULL,
      "campaign_id" integer REFERENCES "automation_campaigns"("id") ON DELETE no action ON UPDATE no action,
      "variant_text" bytea NOT NULL,
      "button_title" text,
      "button_url" text,
      "send_weight" integer DEFAULT 1 NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "lead_subscribers" (
      "id" serial PRIMARY KEY NOT NULL,
      "instagram_username" text NOT NULL,
      "captured_email" text,
      "source_campaign" text,
      "metadata" jsonb DEFAULT '{}'::jsonb,
      "engagement_count" integer DEFAULT 1 NOT NULL,
      "last_engaged_at" timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "lead_subscribers_instagram_username_unique" UNIQUE("instagram_username")
    );`,

    `CREATE TABLE IF NOT EXISTS "test_runs" (
      "id" serial PRIMARY KEY NOT NULL,
      "comment_text" text NOT NULL,
      "username" text DEFAULT 'there' NOT NULL,
      "keywords" text NOT NULL,
      "match_mode" "match_mode" DEFAULT 'partial' NOT NULL,
      "matched" boolean DEFAULT false NOT NULL,
      "matched_keyword" text,
      "rendered_message" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    // Indexes
    `CREATE INDEX IF NOT EXISTS "campaigns_active_idx" ON "automation_campaigns" USING btree ("is_active");`,
    `CREATE INDEX IF NOT EXISTS "dm_logs_comment_idx" ON "ig_dm_logs" USING btree ("comment_id");`,
    `CREATE INDEX IF NOT EXISTS "dm_logs_status_idx" ON "ig_dm_logs" USING btree ("dm_status");`,
    `CREATE INDEX IF NOT EXISTS "dm_logs_created_idx" ON "ig_dm_logs" USING btree ("created_at");`,
    `CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");`,
    `CREATE INDEX IF NOT EXISTS idx_campaigns_reel_media_id ON automation_campaigns(reel_media_id) WHERE reel_media_id IS NOT NULL AND is_active = TRUE;`
  ];

  for (const query of queries) {
    await db.execute(sql.raw(query));
  }
}
