// ---------------------------------------------------------------------
// schema.ts — Table and enum definitions (Drizzle ORM)
// ---------------------------------------------------------------------

import { sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  primaryKey,
  unique,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── Helpers ─────────────────────────────────────────────────────────

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

const softDelete = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

// ─── Enums ───────────────────────────────────────────────────────────

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "canceled",
  "paused",
]);

export const planEnum = pgEnum("plan", ["free", "pro", "pro_annual"]);

export const customDomainStatusEnum = pgEnum("custom_domain_status", [
  "pending",
  "verified",
]);

export const linkStatusEnum = pgEnum("link_status", [
  "active",
  "broken",
  "unknown",
]);

export const deviceEnum = pgEnum("device", ["mobile", "desktop", "tablet"]);

export const weekdayEnum = pgEnum("weekday", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export const notificationDispatchTypeEnum = pgEnum(
  "notification_dispatch_type",
  ["broken_links", "weekly_digest"],
);

export const notificationDispatchStatusEnum = pgEnum(
  "notification_dispatch_status",
  ["processing", "sent", "failed"],
);

// ─── Users ───────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(), // user_id from IAM JWT
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // for short links: /go/[slug]/...
  timezone: text("timezone").notNull().default("UTC"),
  language: text("language").notNull().default("en"), // 'en' | 'es'
  ...timestamps,
});

// ─── Subscriptions ───────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  plan: planEnum("plan").notNull().default("free"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  cancelAt: timestamp("cancel_at", { withTimezone: true }),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  canceledAt: timestamp("canceled_at", { withTimezone: true }),
  ...timestamps,
});

// ─── Custom Domains ──────────────────────────────────────────────────

export const customDomains = pgTable("custom_domains", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  hostname: text("hostname").notNull().unique(),
  status: customDomainStatusEnum("status").notNull().default("pending"),
  isPrimary: boolean("is_primary").notNull().default(false),
  verificationToken: text("verification_token").notNull(),
  verificationHost: text("verification_host").notNull(),
  verificationValue: text("verification_value").notNull(),
  cnameTarget: text("cname_target").notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  ...timestamps,
});

// ─── Brands ──────────────────────────────────────────────────────────

export const brands = pgTable("brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  qrForeground: text("qr_foreground").notNull().default("#111111"),
  qrBackground: text("qr_background").notNull().default("#FFFFFF"),
  isDefault: boolean("is_default").notNull().default(false),
  ...timestamps,
});

// ─── Products ────────────────────────────────────────────────────────

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  ...softDelete,
  ...timestamps,
});

// ─── Links ───────────────────────────────────────────────────────────

export const links = pgTable(
  "links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    brandId: uuid("brand_id").references(() => brands.id, {
      onDelete: "set null",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    baseUrl: text("base_url").notNull(),
    originalUrl: text("original_url").notNull(),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmContent: text("utm_content"),
    utmTerm: text("utm_term"),
    slug: text("slug").notNull(),
    platform: text("platform").notNull().default("other"),
    fallbackUrl: text("fallback_url"),
    status: linkStatusEnum("status").notNull().default("unknown"),
    isEnabled: boolean("is_enabled").notNull().default(true),
    notes: text("notes"),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    lastStatusCode: integer("last_status_code"),
    lastResponseMs: integer("last_response_ms"),
    consecutiveFailures: integer("consecutive_failures").notNull().default(0),
    totalClicks: integer("total_clicks").notNull().default(0),
    ...softDelete,
    ...timestamps,
  },
  (t) => [
    unique().on(t.userId, t.slug),
    // List/filter links by user — covers pagination, soft-delete filter, sorting
    index("links_user_deleted_created_idx").on(
      t.userId,
      t.deletedAt,
      t.createdAt,
    ),
    // Dashboard analytics: filter by user + product
    index("links_user_deleted_product_idx").on(
      t.userId,
      t.deletedAt,
      t.productId,
    ),
    // Link checker cron: pick enabled links ordered by last check
    index("links_enabled_deleted_checked_idx").on(
      t.isEnabled,
      t.deletedAt,
      t.lastCheckedAt,
    ),
    // Broken links queries (dashboard health banner, digest)
    index("links_user_deleted_status_idx").on(t.userId, t.deletedAt, t.status),
  ],
);

// ─── Link Clicks ─────────────────────────────────────────────────────

export const linkClicks = pgTable(
  "link_clicks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    linkId: uuid("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    clickedAt: timestamp("clicked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    country: text("country"),
    city: text("city"),
    device: deviceEnum("device"),
    os: text("os"),
    browser: text("browser"),
    userAgent: text("user_agent"),
    referrer: text("referrer"),
    referrerSource: text("referrer_source"), // youtube | instagram | twitter | direct | other
    isQr: boolean("is_qr").notNull().default(false),
    usedFallback: boolean("used_fallback").notNull().default(false),
    ipHash: text("ip_hash"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmContent: text("utm_content"),
    utmTerm: text("utm_term"),
  },
  (t) => [
    // Primary workhorse: covers all analytics queries (agg, timeseries, countries, devices, browsers, sources, UTM)
    // Both dashboard (JOIN link_clicks ON link_id + clicked_at range) and per-link (WHERE link_id + clicked_at range)
    index("link_clicks_link_clicked_idx").on(t.linkId, t.clickedAt),
    // Recent clicks query: WHERE link_id ORDER BY clicked_at DESC LIMIT 50
    // The above index works for this too (backward scan), but no additional index needed
  ],
);

// ─── Link Checks ─────────────────────────────────────────────────────

export const linkChecks = pgTable(
  "link_checks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    linkId: uuid("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    statusCode: integer("status_code"),
    responseMs: integer("response_ms"),
    isBroken: boolean("is_broken").notNull(),
    checkedAt: timestamp("checked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Cron: query checks by link ordered by checked_at for history
    index("link_checks_link_checked_idx").on(t.linkId, t.checkedAt),
  ],
);

// ─── User Settings ───────────────────────────────────────────────────

export const userSettings = pgTable("user_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  emailOnBrokenLink: boolean("email_on_broken_link").notNull().default(true),
  weeklyDigest: boolean("weekly_digest").notNull().default(true),
  digestDay: weekdayEnum("digest_day").notNull().default("monday"),
  ccEmail: text("cc_email"),
  defaultFallbackUrl: text("default_fallback_url"),
  ...timestamps,
});

// ─── Notification Dispatches ────────────────────────────────────────

export const notificationDispatches = pgTable(
  "notification_dispatches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationDispatchTypeEnum("type").notNull(),
    dedupeKey: text("dedupe_key").notNull(),
    toEmail: text("to_email").notNull(),
    ccEmail: text("cc_email"),
    subject: text("subject").notNull(),
    status: notificationDispatchStatusEnum("status")
      .notNull()
      .default("processing"),
    providerMessageId: text("provider_message_id"),
    error: text("error"),
    payload: jsonb("payload")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [unique().on(t.userId, t.type, t.dedupeKey)],
);

// ─── Tags ────────────────────────────────────────────────────────────

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6B7280"), // gray-500
  ...timestamps,
});

// ─── Link Tags (pivot) ──────────────────────────────────────────────

export const linkTags = pgTable(
  "link_tags",
  {
    linkId: uuid("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.linkId, t.tagId] })],
);
