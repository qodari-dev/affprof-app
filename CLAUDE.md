@AGENTS.md

# AffProf — Affiliate Link Manager

## What is this

SaaS for content creators and affiliate marketers.
Manage all your affiliate links in one place — create short links, generate QR codes,
track clicks and metrics, and get alerted when a link goes down.

## Core value proposition

"Never lose affiliate commissions to broken links or blind traffic again."

## Core user flow

1. User registers → account created in IAM + local users table
2. User creates a product (e.g. "Blue Yeti Microphone")
3. User adds affiliate links under that product (Amazon, ShareASale, etc.)
4. App generates a short link → affprof.com/go/[slug]
5. App generates a QR code for that short link automatically
6. Every click on the short link is logged before redirecting
7. Cron job runs every 24h → pings original affiliate URLs → saves status
8. If link is broken → send alert email via Resend
9. Dashboard shows: clicks, sources, devices, countries, link status, etc

## Tech stack

- **Framework**: Next.js (App Router)
- **Database**: Postgres
- **Auth**: External IAM
- **Cron**: Vercel Cron or regular cron depends at the end
- **Email**: Resend
- **Payments**: Stripe Checkout (hosted)
- **Deploy**: Vercel or dokploy or something like that to better control
- **QR generation**: library npm

## Repos

- affprof-web → affprof.com (landing, pricing, marketing)
- affprof-app → app.affprof.com (dashboard, auth, cron)

## URL structure

- affprof.com → landing page (public)
- app.affprof.com → dashboard (auth required)
- auth.affprof.com → IAM login (handled by IAM)
- affprof.com/go/[slug] → short link redirect (public, logs click)

## Auth flow (IAM)

- IAM account: AffProf
- IAM app: AffProf App (has client_key, secret, callback URL)
- On login: app redirects to auth.affprof.com → IAM handles login/2FA
  → redirects back with code → app exchanges code for JWT token
- JWT contains user_id — use this as the primary key in local DB
- No local password handling. IAM owns all auth logic.
- On register: app calls IAM POST /register → IAM creates user
  → returns token → app creates local users row

## Subscription logic

- Subscription status lives in the app DB, NOT in IAM
- IAM = who you are. App DB = if you paid.
- Stripe sends webhooks on every status change → app updates subscriptions.status
- Before showing dashboard: check subscriptions.status = 'active'

## Database schema inicial idea

### users

- id TEXT PK — user_id from IAM JWT
- email TEXT
- name TEXT
- slug or account TEXT // for shorling generate
- created_at TIMESTAMP

### subscriptions

- id UUID PK
- user_id TEXT FK → users.id
- stripe_customer_id TEXT
- stripe_subscription_id TEXT
- status TEXT — active | past_due | canceled | paused
- plan TEXT — free | pro | pro_annual
- current_period_end TIMESTAMP
- canceled_at TIMESTAMP
- created_at TIMESTAMP

### products

- id UUID PK
- user_id TEXT FK → users.id
- name TEXT
- description TEXT
- created_at TIMESTAMP

### links

- id UUID PK
- product_id UUID FK → products.id
- original_url TEXT — the real affiliate URL
- slug TEXT UNIQUE — short link slug (e.g. "blueyeti-amazon")
- platform TEXT — amazon | shareasale | impact | other
- status TEXT — active | broken | unknown
- last_checked_at TIMESTAMP
- last_status_code INT
- last_response_ms INT
- consecutive_failures INT DEFAULT 0
- total_clicks INT DEFAULT 0
- created_at TIMESTAMP

### link_clicks (every click event)

- id UUID PK
- link_id UUID FK → links.id
- clicked_at TIMESTAMP
- country TEXT — from IP geolocation
- city TEXT
- device TEXT — mobile | desktop | tablet
- os TEXT — iOS | Android | Windows | macOS | other
- browser TEXT — Chrome | Safari | Firefox | other
- referrer TEXT — full referrer URL
- referrer_source TEXT — youtube | instagram | twitter | direct | other
- is_qr BOOLEAN — came from QR code scan?
- ip_hash TEXT — hashed for privacy, not raw IP

### link_checks (monitoring history)

- id UUID PK
- link_id UUID FK → links.id
- status_code INT
- response_ms INT
- is_broken BOOLEAN
- checked_at TIMESTAMP

## Short link redirect logic (affprof.com/go/[account]/[slug])

1. Request hits Next.js API route /go/[account]/[slug]
2. Look up link by account and slug in DB
3. Log click: parse user-agent, referrer, IP, country, etc → save to link_clicks
4. Detect if request is from QR (via ?qr=1 param or known QR scanners)
5. Increment links.total_clicks
6. Return 302 redirect to original_url
7. Total time < 50ms — user doesn't notice (maybe queue to redirect fast but take all the data needed)

## QR Code generation

- Generated server-side using 'qrcode' npm package if that one is the one of the best
- QR points to: affprof.com/go/[account]/[slug]?qr=1
- Stored as base64 PNG in DB or generated on-the-fly
- Available for download (PNG)

## Click analytics (dashboard)

Per link:

- Total clicks (all time, this month, this week, today)
- Clicks over time chart (daily)
- Top countries (pie or bar)
- Top referrer sources (YouTube, Instagram, Twitter, Direct, Other)
- Device split (mobile vs desktop)
- QR vs link clicks

Per product (aggregate of all links):

- Best performing link
- Total clicks across all links

## Cron job logic (runs every 24h via Vercel Cron or regular cron depends on final decision)

1. Fetch all links where user has active subscription
2. For each link: GET request to original_url with 10s timeout
3. If status 200 → update status=active, consecutive_failures=0
4. If status 4xx/5xx or timeout → increment consecutive_failures
5. If consecutive_failures >= 2 → update status=broken, send alert email -> depends on settings need to think better
6. Save row in link_checks every run
7. Free plan: only check links, no click analytics (depends on the plan we design at the end)

## Email alerts (Resend)

- Trigger: link status changes to broken
- To: user email
- Subject: "[AffProf] Your link for [product name] is broken"
- Body: original URL, platform, since when, link to dashboard to fix
- One email per broken link (not batched)
- Weekly summary email (Pro): all link statuses + top performing links

## Stripe webhooks to handle -> double check if there are more

- checkout.session.completed → create subscription, status=active
- invoice.payment_succeeded → update current_period_end
- invoice.payment_failed → status=past_due
- customer.subscription.deleted → status=canceled, canceled_at=now
- customer.subscription.paused → status=paused

## MVP scope (build this first)

- [ ] Auth with IAM (login, register, logout, callback)
- [ ] Create / edit / delete products
- [ ] Add / edit / delete links per product
- [ ] Auto-generate slug for each link
- [ ] Short link redirect with click logging (/go/[account]/[slug])
- [ ] QR code generation per link (downloadable PNG)
- [ ] Dashboard: links list with status badges + total clicks
- [ ] Click analytics per link (basic: total, country, device, source)
- [ ] Manual link check button
- [ ] Cron job 24h automatic check
- [ ] Email alert when link goes broken
- [ ] Stripe Checkout (free vs basic vs pro) maybe free no not sure
- [ ] Webhook handler for Stripe events
- [ ] Weekly digest email
- [ ] Basic landing page with pricing

## Out of scope for MVP

- Import from Amazon Associates / ShareASale API
- Affiliate tag protection / hijack detection
- Team members / shared access
- A/B testing links
- Custom branded short domains
- Mobile app

## Key rules

- Always filter DB queries by user_id — users only see their own data
- Never store raw IPs — hash them for privacy
- /go/[account]/[slug] route must be fast
- Cron only runs checks for users with status = active subscription
- Generate slug from product name + platform, allow manual override
