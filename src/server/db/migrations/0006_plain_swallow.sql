ALTER TABLE "links" ADD COLUMN "base_url" text;--> statement-breakpoint
UPDATE "links" SET "base_url" = "original_url" WHERE "base_url" IS NULL;--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "base_url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "utm_source" text;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "utm_medium" text;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "utm_campaign" text;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "utm_content" text;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "utm_term" text;
