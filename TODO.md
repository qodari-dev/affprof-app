# AffProf — Roadmap & Future Features

> **Important note:** This roadmap is NOT a commitment. It's a parking lot of ideas validated against competitor analysis. Features should be implemented based on **real user feedback**, not on what competitors have. Distribution and getting real users is always priority #1 over adding features.

---

## Status Legend

- 🚀 **Sprint N** — Planned for sprint N (after we have first 5 paying users)
- 💡 **Idea** — Validated but no priority assigned yet
- ❄️ **Frozen** — Not implementing, here for reference
- ✅ **Done** — Already shipped

---

## Sprint 1 — Quick Wins (when we start)

### 2FA (Two-Factor Authentication) 🚀

**What:** Add 2FA option in user settings.
**Why:** Standard security feature for serious clients. Already supported by our IAM (iam.qodari.com).
**Effort:** Low (just expose it in AffProf settings UI).
**Notes:** No need to build, just enable the existing IAM feature.

### Multiple Custom Domains (subdomains) per account 🚀

**What:** Allow Pro users to connect 2-3 custom subdomains instead of just 1.
**Why:** Industry standard. Agencies need this for managing multiple clients (`links.client1.com`, `links.client2.com`).
**Effort:** Medium. Need to update domain table to support multiple per user, update routing logic, UI for adding/removing domains.
**Notes:** Free plan: 1 domain. Pro: 3 domains. Future Business tier: 10+.

### Bulk Operations on Existing Links 🚀

**What:** Bulk delete, bulk archive, bulk tag/untag, bulk move to product.
**Why:** Agencies and power users with many links need this to manage at scale.
**Effort:** Low. We already have bulk import. Just add UI for "select multiple" + batch endpoints.
**Notes:** Add clear confirmation modals especially for bulk delete.

---

## Sprint 2 — Visual Upgrade

### Branded QR codes with Frames + CTAs 🚀

**What:** Upgrade existing branded QR codes to include decorative frames and customizable text labels (e.g., "Scan me", "Get 10% off", "Visit our menu").
**Why:** Increases scan rates significantly. Highly demanded by small businesses (restaurants, retail, events).
**Effort:** Medium. UI for selecting frame style + text input + preview. SVG/PNG generation logic update.
**Notes:** Templates: simple frame, "scan me" arrow, branded badge, etc. Allow custom text per QR.

### Public Profile Page `/u/{username}` 🚀

**What:** A simple public-facing page per user showing their profile (logo, name, bio, featured links).
**Why:** Foundation for "Smart Fallback" feature in Sprint 3. Also useful as a basic bio-link page.
**Effort:** Medium. New page route, profile customization in settings, public render.
**Notes:** Don't compete head-to-head with Linktree. Just enough to be useful as fallback.

---

## Sprint 3 — Smart Features

### Link Expiration 🚀

**What:** Allow users to set an expiration date/time on a link. Configurable behavior on expiration: show "expired" page, redirect to fallback URL, or redirect to destination domain homepage.
**Why:** Useful for time-limited promos, events, exclusive content windows.
**Effort:** Low. Add `expires_at` column. In redirect handler, check expiration and apply configured behavior.
**Notes:** Default behavior: show stylized "this link has expired" page with optional CTA.

### Password-Protected Links 🚀

**What:** Optionally protect a link with a password. Visitor sees a password prompt before being redirected.
**Why:** Demanded by coaches, educators sharing exclusive content; companies sharing confidential resources.
**Effort:** Low-Medium. Add `password_hash` column. Intermediate page for password input. Set 24h cookie after correct password to avoid re-prompting.
**Notes:** UX critical: don't make user re-enter password every time.

### Smart Fallback (Profile Page) 🚀 ⭐

**What:** When a link breaks AND no fallback URL is configured, automatically redirect to the user's public profile page (`/u/{username}`) showing their other active links.
**Why:** Triple win: visitor doesn't hit 404, user keeps traffic, AffProf gets subtle branding ("Link managed by AffProf"). **No competitor has this.**
**Effort:** Low (after profile page from Sprint 2 exists). Just a routing decision in the redirect handler when link is broken and no fallback set.
**Notes:** This is one of our most differentiating ideas. Combines our health monitoring strength with bio-links territory without building a full Linktree competitor.

---

## Sprint 4 — Power Features

### A/B Testing 🚀

**What:** Allow users to set up multiple destination URLs for a single short link, distributed by configurable weights (e.g., 50/50, 33/33/33). Track conversions per variant.
**Why:** Highly requested by serious marketers. High perceived value, justifies Pro tier.
**Effort:** Medium. New `link_variants` table. Distribution logic in redirect handler. Dashboard showing performance per variant.
**Notes:** Initially simple weight-based routing. Conversion tracking via webhook callback or pixel from destination.

### Link Rotation 🚀

**What:** Same as A/B testing but the goal isn't to find a winner — it's permanent traffic distribution between multiple destinations.
**Why:** Useful for distributing leads across multiple sales reps, distributing load across multiple Calendly accounts, A/B/C/D testing.
**Effort:** Trivial after A/B testing is built. Same code, different UI affordance.
**Notes:** Build A/B first, expose rotation as a UI variation.

### Geo-targeting / Dynamic Routing 🚀

**What:** Same short link redirects to different URLs based on visitor's country, device, OS, browser, or time of day.
**Why:** Powerful for affiliate marketers (Amazon US vs Amazon ES), apps (iOS vs Android), local businesses (open vs closed hours).
**Effort:** Medium. New `link_routes` table. Detect country from `x-vercel-ip-country` header (Vercel provides this for free). Match rules in redirect handler.
**Notes:** Start with country-based routing. Add device/time later.

**Implementation sketch:**

```typescript
// Get country from Vercel headers
const country = req.headers.get('x-vercel-ip-country') || '*';

// Find matching route or default
const route = await findRoute(linkId, country);
const destination = route?.url ?? link.defaultUrl;

return NextResponse.redirect(destination, 302);
```

---

## Sprint 5 — Integration Layer

### Public API with Authentication 🚀

**What:** REST API allowing external applications to programmatically create, read, update, delete links and access analytics.
**Why:** Required by agencies with many clients, e-commerce stores syncing products, developer adoption. Foundation for Zapier integration and webhooks.
**Effort:** Medium. We probably already have internal Next.js endpoints. Need to:

- Add `api_keys` table (user_id, key_hash, name, last_used_at, scopes)
- Auth middleware that validates `Authorization: Bearer ...` header
- Document endpoints (Swagger/Postman/Mintlify)
- Rate limiting per API key

**Endpoints to expose:**

```
POST   /api/v1/links              # Create link
GET    /api/v1/links              # List user's links (paginated)
GET    /api/v1/links/{id}         # Get link details
PATCH  /api/v1/links/{id}         # Update link
DELETE /api/v1/links/{id}         # Delete link
GET    /api/v1/links/{id}/stats   # Analytics
POST   /api/v1/qr                 # Generate QR
GET    /api/v1/products           # List products
POST   /api/v1/products           # Create product
```

### Webhooks 🚀

**What:** AffProf calls user-configured URLs when events happen (link clicked, link broken, link recovered, etc.).
**Why:** Real-time integration with user's CRM, Slack, custom workflows. Foundation for Zapier triggers.
**Effort:** Medium. New `webhooks` table (user_id, url, events[], secret). Async queue (Vercel cron or BullMQ) so webhook calls don't block redirects. HMAC signature for security.

**Events to support:**

```
link.created
link.clicked
link.broken
link.recovered
qr.scanned
link.expired
```

**Sample payload:**

```json
{
  "event": "link.clicked",
  "link_id": "abc123",
  "destination": "amazon.com/...",
  "country": "US",
  "device": "mobile",
  "timestamp": "2026-05-03T15:23:00Z",
  "signature": "hmac_xxx"
}
```

### Pixel Tracking (Meta, Google) 🚀

**What:** Optionally fire a Meta or Google Ads pixel when someone clicks a link, before redirecting.
**Why:** Marketers running paid ads can retarget visitors who clicked specific links.
**Effort:** Low-Medium. Per-link config: Meta Pixel ID, Google Ads ID. Redirect handler serves intermediate HTML page with pixel scripts + meta refresh redirect.
**Notes:** **Trade-off important:** Adds ~200ms latency and breaks social media preview cards. Must be **opt-in per link**, never global.

---

## Sprint 6 — Premium Features

### Custom Social Preview Override 🚀

**What:** When a short link is shared on social media (Twitter, WhatsApp, LinkedIn), show custom OG tags (title, description, image) instead of the destination's default tags.
**Why:** Users with affiliate links to generic landing pages can override with their own branding. Coaches sharing course platform links can show their own branded preview.
**Effort:** Medium. Per-link `og_title`, `og_description`, `og_image_url` columns. Detect bots in redirect handler via User-Agent. If bot + custom preview is set, serve HTML with custom OG tags. Otherwise normal redirect.

**Implementation sketch:**

```typescript
const isBot = /Twitterbot|facebookexternalhit|LinkedInBot|Slackbot|WhatsApp/i.test(
  req.headers.get('user-agent') || ''
);

if (isBot && link.customPreview) {
  return new Response(htmlWithCustomOgTags, {
    headers: { 'Content-Type': 'text/html' },
  });
}

return NextResponse.redirect(link.destination, 302);
```

### Zapier Integration 🚀

**What:** Official Zapier app so users can connect AffProf to 5,000+ apps without coding.
**Why:** Massive distribution channel. Users can build workflows like "new link created → row in Google Sheets" without help from us.
**Effort:** Medium (after API + Webhooks exist). Register as Zapier developer. Define triggers (link.created, link.clicked, etc.) and actions (create link, generate QR, etc.).
**Notes:** Triggers map to webhooks, actions map to API endpoints. Most work is filling Zapier templates and getting their review.

---

## 💡 Ideas to Keep on Radar (no priority)

### Mobile App

**Note:** PWA covers 80% of use cases with 5% of effort. Native app is a time trap for solo founder. Defer indefinitely.

### Bio Links Page (Linktree-style)

**Note:** Public profile page from Sprint 2 is the foundation. Could expand to full Linktree-style page if data shows demand. Mercado saturado but tu esposa y otros coaches lo usan — ver caso.

### Link in Bio Smart Mode

**Note:** Combine smart fallback with full bio links. If a link breaks, show ALL user's links not just one. Already partially in Sprint 3.

### Browser Extension (Chrome)

**Note:** Quick-shorten button in browser. Useful, but PWA-first. Build only after Sprint 5 done.

### Click Fraud Protection

**Note:** Detect bot clicks, click farms, malicious patterns. Useful for marketers running paid ads. Low priority for current target audience.

### Affiliate Program Auto-detection

**Note:** When a user pastes an Amazon URL, detect their affiliate tag automatically and warn if missing. Small UX win for affiliate marketers.

---

## ❄️ Frozen — Not Implementing

### Open Source / Self-hosted

**Why frozen:** Incompatible with single-founder SaaS business model. Dub.co does it but they have funding to handle the support burden.

### SOC 2 / HIPAA Compliance

**Why frozen:** $10K-30K cost, 6-12 months process. Only worth it once we cross $50K MRR and target enterprise clients. Not our market.

### CTA Overlays on Destination Pages

**Why frozen:** Legal gray area. Violates Amazon Associates terms and several other affiliate programs. Doesn't align with "trustworthy infrastructure" positioning.

### Deep Linking (iOS/Android URI schemes)

**Why frozen:** Complex implementation (Universal Links, App Links, URI schemes). Our target audience (small business, creators, marketers) doesn't need this. App developers can use other tools.

### Stripe Revenue Attribution

**Why frozen:** Specific to SaaS founders measuring revenue per click. Not our target audience. Dub.co's specialty.

### Affiliate Program Management Platform

**Why frozen:** Entire separate product (think Tapfiliate, Rewardful, Tolt). Massive scope, distracts from core link management. Dub Partners is essentially their second product.

### White-Label / Reseller Features

**Why frozen:** Tier-3 feature for Business plan ($99-199). Worth building only after solid Pro tier adoption.

---

## Decision Framework

When evaluating a new feature request:

1. **Is it from a paying user?** Higher priority.
2. **Does it solve a real problem they articulated?** Or is it a "nice to have"?
3. **Does it require fundamental changes to architecture?** Then defer.
4. **Does it strengthen our differentiator (health monitoring + reliability)?** Higher priority.
5. **Is it a feature that makes us "complete" vs competitors but isn't unique?** Lower priority unless multiple users ask.

**Always remember:** "We don't lose users because we don't have feature X. We lose users because they don't know we exist." Distribution > features.

---

## Last Updated

2026-05-03 — Initial competitive analysis and roadmap parking lot.
