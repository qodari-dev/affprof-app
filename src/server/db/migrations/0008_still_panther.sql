ALTER TABLE "links" ADD COLUMN "brand_id" uuid;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
