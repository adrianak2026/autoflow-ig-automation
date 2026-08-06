CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'fulfilled', 'refunded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('digital_download', 'cashback_offer', 'affiliate_deal');--> statement-breakpoint
CREATE TABLE "automation_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"trigger_keywords" text NOT NULL,
	"reply_template" text NOT NULL,
	"match_mode" text DEFAULT 'partial' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"total_dms_sent" integer DEFAULT 0 NOT NULL,
	"total_comments" integer DEFAULT 0 NOT NULL,
	"owner_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ig_dm_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" text NOT NULL,
	"ig_username" text NOT NULL,
	"comment_text" text NOT NULL,
	"matched_keyword" text,
	"dm_status" text DEFAULT 'sent' NOT NULL,
	"campaign_id" uuid,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "test_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment_text" text NOT NULL,
	"username" text DEFAULT 'there' NOT NULL,
	"keywords" text NOT NULL,
	"match_mode" text DEFAULT 'partial' NOT NULL,
	"matched" boolean DEFAULT false NOT NULL,
	"matched_keyword" text,
	"rendered_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text,
	"display_name" text,
	"avatar_url" text,
	"instagram_page_id" text,
	"role" text DEFAULT 'admin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_instagram_page_id_unique" UNIQUE("instagram_page_id")
);
--> statement-breakpoint
ALTER TABLE "automation_campaigns" ADD CONSTRAINT "automation_campaigns_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ig_dm_logs" ADD CONSTRAINT "ig_dm_logs_campaign_id_automation_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."automation_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campaigns_active_idx" ON "automation_campaigns" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "dm_logs_comment_idx" ON "ig_dm_logs" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "dm_logs_status_idx" ON "ig_dm_logs" USING btree ("dm_status");--> statement-breakpoint
CREATE INDEX "dm_logs_created_idx" ON "ig_dm_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");