// ---------------------------------------------------------------------
// relations.ts — Drizzle ORM relation definitions
// ---------------------------------------------------------------------

import { relations } from "drizzle-orm";
import {
  users,
  subscriptions,
  customDomains,
  brands,
  products,
  links,
  linkClicks,
  linkChecks,
  userSettings,
  notificationDispatches,
  tags,
  linkTags,
} from "./schema";

// ─── Users ───────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  customDomains: many(customDomains),
  brands: many(brands),
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  products: many(products),
  links: many(links),
  notificationDispatches: many(notificationDispatches),
  tags: many(tags),
}));

// ─── Subscriptions ───────────────────────────────────────────────────

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

// ─── Custom Domains ──────────────────────────────────────────────────

export const customDomainsRelations = relations(customDomains, ({ one }) => ({
  user: one(users, {
    fields: [customDomains.userId],
    references: [users.id],
  }),
}));

// ─── Brands ──────────────────────────────────────────────────────────

export const brandsRelations = relations(brands, ({ one }) => ({
  user: one(users, {
    fields: [brands.userId],
    references: [users.id],
  }),
}));

// ─── Products ────────────────────────────────────────────────────────

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  links: many(links),
}));

// ─── Links ───────────────────────────────────────────────────────────

export const linksRelations = relations(links, ({ one, many }) => ({
  product: one(products, {
    fields: [links.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [links.userId],
    references: [users.id],
  }),
  clicks: many(linkClicks),
  checks: many(linkChecks),
  linkTags: many(linkTags),
}));

// ─── Link Clicks ─────────────────────────────────────────────────────

export const linkClicksRelations = relations(linkClicks, ({ one }) => ({
  link: one(links, {
    fields: [linkClicks.linkId],
    references: [links.id],
  }),
}));

// ─── Link Checks ─────────────────────────────────────────────────────

export const linkChecksRelations = relations(linkChecks, ({ one }) => ({
  link: one(links, {
    fields: [linkChecks.linkId],
    references: [links.id],
  }),
}));

// ─── User Settings ───────────────────────────────────────────────────

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

// ─── Notification Dispatches ────────────────────────────────────────

export const notificationDispatchesRelations = relations(notificationDispatches, ({ one }) => ({
  user: one(users, {
    fields: [notificationDispatches.userId],
    references: [users.id],
  }),
}));

// ─── Tags ────────────────────────────────────────────────────────────

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
  linkTags: many(linkTags),
}));

// ─── Link Tags (pivot) ──────────────────────────────────────────────

export const linkTagsRelations = relations(linkTags, ({ one }) => ({
  link: one(links, {
    fields: [linkTags.linkId],
    references: [links.id],
  }),
  tag: one(tags, {
    fields: [linkTags.tagId],
    references: [tags.id],
  }),
}));
