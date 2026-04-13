CREATE INDEX "link_checks_link_checked_idx" ON "link_checks" USING btree ("link_id","checked_at");--> statement-breakpoint
CREATE INDEX "link_clicks_link_clicked_idx" ON "link_clicks" USING btree ("link_id","clicked_at");--> statement-breakpoint
CREATE INDEX "links_user_deleted_created_idx" ON "links" USING btree ("user_id","deleted_at","created_at");--> statement-breakpoint
CREATE INDEX "links_user_deleted_product_idx" ON "links" USING btree ("user_id","deleted_at","product_id");--> statement-breakpoint
CREATE INDEX "links_enabled_deleted_checked_idx" ON "links" USING btree ("is_enabled","deleted_at","last_checked_at");--> statement-breakpoint
CREATE INDEX "links_user_deleted_status_idx" ON "links" USING btree ("user_id","deleted_at","status");