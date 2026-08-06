CREATE TABLE "ai_auto_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"intent_category" text NOT NULL,
	"fallback_dm_template" text NOT NULL,
	"ai_prompt_instructions" text,
	"confidence_score" numeric(3, 2) DEFAULT '0.85',
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instagram_username" text NOT NULL,
	"captured_email" text,
	"source_campaign" text,
	"engagement_count" integer DEFAULT 1 NOT NULL,
	"last_engaged_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lead_subscribers_instagram_username_unique" UNIQUE("instagram_username")
);
--> statement-breakpoint
CREATE TABLE "message_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"variant_text" text NOT NULL,
	"button_title" text,
	"button_url" text,
	"send_weight" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_triggers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trigger_name" text NOT NULL,
	"story_keyword" text,
	"dm_reply_template" text NOT NULL,
	"cta_button_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "message_variants" ADD CONSTRAINT "message_variants_campaign_id_automation_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."automation_campaigns"("id") ON DELETE no action ON UPDATE no action;