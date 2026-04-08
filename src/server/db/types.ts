// ---------------------------------------------------------------------
// types.ts — Inferred TypeScript types from Drizzle schema
// ---------------------------------------------------------------------

import type {
  users,
  subscriptions,
  products,
  links,
  linkClicks,
  linkChecks,
  userSettings,
  tags,
  linkTags,
} from "./schema";

// ─── Users ───────────────────────────────────────────────────────────

export type Users = typeof users.$inferSelect & {
  subscription?: Subscriptions | null;
  settings?: UserSettings | null;
  products?: Products[];
  links?: Links[];
  tags?: Tags[];
};
export type NewUsers = typeof users.$inferInsert;

// ─── Subscriptions ───────────────────────────────────────────────────

export type Subscriptions = typeof subscriptions.$inferSelect & {
  user?: Users;
};
export type NewSubscriptions = typeof subscriptions.$inferInsert;

// ─── Products ────────────────────────────────────────────────────────

export type Products = typeof products.$inferSelect & {
  user?: Users;
  links?: Links[];
};
export type NewProducts = typeof products.$inferInsert;

// ─── Links ───────────────────────────────────────────────────────────

export type Links = typeof links.$inferSelect & {
  product?: Products;
  user?: Users;
  clicks?: LinkClicks[];
  checks?: LinkChecks[];
  linkTags?: LinkTags[];
};
export type NewLinks = typeof links.$inferInsert;

// ─── Link Clicks ─────────────────────────────────────────────────────

export type LinkClicks = typeof linkClicks.$inferSelect & {
  link?: Links;
};
export type NewLinkClicks = typeof linkClicks.$inferInsert;

// ─── Link Checks ─────────────────────────────────────────────────────

export type LinkChecks = typeof linkChecks.$inferSelect & {
  link?: Links;
};
export type NewLinkChecks = typeof linkChecks.$inferInsert;

// ─── User Settings ───────────────────────────────────────────────────

export type UserSettings = typeof userSettings.$inferSelect & {
  user?: Users;
};
export type NewUserSettings = typeof userSettings.$inferInsert;

// ─── Tags ────────────────────────────────────────────────────────────

export type Tags = typeof tags.$inferSelect & {
  user?: Users;
  linkTags?: LinkTags[];
};
export type NewTags = typeof tags.$inferInsert;

// ─── Link Tags ───────────────────────────────────────────────────────

export type LinkTags = typeof linkTags.$inferSelect & {
  link?: Links;
  tag?: Tags;
};
export type NewLinkTags = typeof linkTags.$inferInsert;
