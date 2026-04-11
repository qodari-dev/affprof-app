CREATE TYPE "public"."custom_domain_status" AS ENUM('pending', 'verified');--> statement-breakpoint
CREATE TABLE "custom_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"hostname" text NOT NULL,
	"status" "custom_domain_status" DEFAULT 'pending' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"verification_token" text NOT NULL,
	"verification_host" text NOT NULL,
	"verification_value" text NOT NULL,
	"cname_target" text NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "custom_domains_hostname_unique" UNIQUE("hostname")
);--> statement-breakpoint
ALTER TABLE "custom_domains" ADD CONSTRAINT "custom_domains_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
