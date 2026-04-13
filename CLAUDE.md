@AGENTS.md

# AffProf — Affiliate Link Manager

SaaS for content creators and affiliate marketers. One place to manage affiliate
links — short links, QR codes, click analytics, and alerts when links break.

**Value prop**: "Never lose affiliate commissions to broken links or blind traffic again."

## Tech stack

- **Framework**: Next.js (App Router) — see `AGENTS.md`, this is a non-standard version
- **Database**: Postgres + Drizzle ORM (`src/server/db/schema.ts` is the source of truth)
- **API layer**: `ts-rest` contracts + handlers in `src/server/api/`
- **Frontend data**: `@ts-rest/react-query` hooks in `src/hooks/queries/`
- **Schemas**: Zod schemas in `src/schemas/` for bodies, queries, and shared types
- **Auth**: External IAM (`auth.affprof.com`), JWT with `user_id` as PK
- **Email**: Resend
- **Payments**: Stripe Checkout (hosted) + webhooks
- **QR generation**: `qrcode` npm package + branded QR with logo overlay
- **UI**: shadcn/ui (Base UI) components in `src/components/ui/`
- **Charts**: Recharts via `src/components/ui/chart.tsx`

## Repos

- `affprof-web` → `affprof.com` (landing, pricing)
- `affprof-app` → `app.affprof.com` (this repo — dashboard, auth, cron, API)

## URL structure

- `affprof.com` → landing (public)
- `app.affprof.com` → dashboard (auth required)
- `auth.affprof.com` → IAM login (handled externally)
- `affprof.com/go/[account]/[slug]` → short link redirect (public, logs click, < 50ms)

## Key architectural decisions

### Auth & identity
- IAM owns all auth (login, 2FA, register, password reset). No local password handling.
- JWT `user_id` is the PK in the local `users` table (text, not UUID).
- On login: redirect to IAM → callback exchanges code for JWT.
- On register: call IAM `/register` → create local `users` row.

### Subscriptions
- Status lives in the **app DB**, not IAM. IAM = identity. App DB = billing.
- Stripe webhooks are the source of truth for subscription status changes.
- Gate dashboard on `subscriptions.status === 'active'`.

### Data model
- All tables are user-scoped. **Every query must filter by `user_id`.**
- Soft delete (`deleted_at`) on products and links.
- Cascade delete on child/pivot tables (`link_clicks`, `link_checks`, `link_tags`).
- Links support UTM params (`utm_source`, `utm_medium`, etc.), fallback URLs, and QR brands.

### API patterns
- Contracts in `src/server/api/contracts/`, handlers in `src/server/api/handlers/`.
- Both registered in their respective `index.ts` barrel files.
- Follow existing patterns (see `link.ts`, `product.ts`, `analytics.ts`) when adding new resources.
- Use `genericTsRestErrorResponse` for error handling, `getAuthContext` for auth.

### Analytics
- **Dashboard** (`GET /api/v1/analytics/dashboard`): aggregated KPIs, timeseries, top links/products, traffic sources, countries, broken links. Supports `range` (7d/30d/90d/180d/360d) and optional `productId` filter.
- **Per-link** (`GET /api/v1/analytics/link/:id`): same breakdowns scoped to a single link + device/browser breakdown + recent clicks table. Supports `range`.
- Queries use raw SQL via drizzle `sql` template for aggregations with `Promise.all`.

### Short link redirect
- Route: `/go/[account]/[slug]`. Must be fast (< 50ms).
- Parse UA / referrer / IP / geo → log click → 302 redirect.
- Detect QR scans via `?qr=1` param. Track `used_fallback` for geo-routing.

### Cron / link monitoring
- Runs every 24h for users with active subscriptions.
- `GET` original URL with 10s timeout; log to `link_checks`.
- After N consecutive failures → `status = 'broken'` → alert email (respects `user_settings`).

## Non-negotiable rules

- **Always filter DB queries by `user_id`.** Users must never see another user's data.
- **Never store raw IPs.** Hash them (`ip_hash`) for privacy.
- **Keep `/go/[account]/[slug]` fast.** No heavy work in the redirect path.
- **Cron only runs for active subscriptions.**

## Out of scope for MVP

- Amazon/ShareASale API imports
- Affiliate hijack detection
- A/B testing links
- Team members / shared access
- Mobile app
