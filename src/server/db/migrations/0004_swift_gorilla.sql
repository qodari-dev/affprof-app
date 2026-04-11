ALTER TABLE "links" ADD COLUMN "fallback_url" text;--> statement-breakpoint
ALTER TABLE "link_clicks" ADD COLUMN "used_fallback" boolean DEFAULT false NOT NULL;
