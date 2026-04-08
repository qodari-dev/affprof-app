// ---------------------------------------------------------------------
// schema.ts — Table and enum definitions (Drizzle ORM)
// ---------------------------------------------------------------------

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

// ─── Users ───────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(), // user_id from IAM JWT
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // for short links: /go/[slug]/...
  timezone: text("timezone").notNull().default("UTC"),
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
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  canceledAt: timestamp("canceled_at", { withTimezone: true }),
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
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    originalUrl: text("original_url").notNull(),
    slug: text("slug").notNull(),
    platform: text("platform").notNull().default("other"),
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
  (t) => [unique().on(t.userId, t.slug)],
);

// ─── Link Clicks ─────────────────────────────────────────────────────

export const linkClicks = pgTable("link_clicks", {
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
  ipHash: text("ip_hash"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
});

// ─── Link Checks ─────────────────────────────────────────────────────

export const linkChecks = pgTable("link_checks", {
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
});

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
  ...timestamps,
});

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
