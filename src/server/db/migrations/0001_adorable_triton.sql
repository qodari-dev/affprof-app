CREATE TYPE "public"."notification_dispatch_status" AS ENUM('processing', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."notification_dispatch_type" AS ENUM('broken_links', 'weekly_digest');--> statement-breakpoint
CREATE TABLE "notification_dispatches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_dispatch_type" NOT NULL,
	"dedupe_key" text NOT NULL,
	"to_email" text NOT NULL,
	"cc_email" text,
	"subject" text NOT NULL,
	"status" "notification_dispatch_status" DEFAULT 'processing' NOT NULL,
	"provider_message_id" text,
	"error" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_dispatches_user_id_type_dedupe_key_unique" UNIQUE("user_id","type","dedupe_key")
);
--> statement-breakpoint
ALTER TABLE "notification_dispatches" ADD CONSTRAINT "notification_dispatches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;