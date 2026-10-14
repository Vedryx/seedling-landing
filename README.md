# The Seedling — landing page (Version B)

React + Vite build of the handoff design, version B: *“Find out what your child does when they get stuck.”*
Styles come straight from the handoff `css/styles.css` (now `src/styles.css`), with additions at the bottom for the booking sheet.

## Run
```bash
npm install
cp .env.example .env     # fill in Cashfree sandbox keys
npm run server           # reference payment API on :8787
npm run dev              # site on :5173 (proxies /api to :8787)
```
`npm run build` outputs static files in `dist/`. Host as an SPA (rewrite all paths to `index.html`) so `/thank-you` and `/policies` work.

## Routes
- `/` — landing page (hero, sample note, FAQs, sticky book bar on phones)
- `/thank-you?order_id=…` — checks the order status with the backend, then shows success, pending or failed
- `/policies#terms|privacy|refunds|contact`

## Payment flow (Cashfree)
1. Book button → booking sheet (parent name, WhatsApp number, optional email, child’s first name, class).
2. `POST /api/orders` → backend creates a Cashfree order for `SESSION_PRICE_INR` rupees (set on the server, never taken from the browser) and returns `payment_session_id`.
3. Frontend calls `cashfree.checkout({ paymentSessionId, redirectTarget: '_self' })` (`src/lib/payments.js`).
4. Cashfree redirects to `return_url` = `SITE_URL/thank-you?v=b&order_id=…`.
5. Thank-you page calls `GET /api/orders/:id`. If the status is `PAID`, it shows the confirmation and fires the Meta Pixel `Purchase` event.

`server/index.js` is a dependency-free reference for those two endpoints. Port them to your real backend; the secret key must never reach the browser.
Before going live:
- Add a webhook (`notify_url`) and treat it as the source of truth.
- Save each booking against its `order_id`.
- Set `CASHFREE_ENV=production` (the browser checkout follows it automatically).
- Whitelist your domain in the Cashfree dashboard.

## Analytics (PostHog, US cloud, project 655191)
- `src/lib/analytics.js` loads PostHog lazily after the page renders. The token is in `.env.production`. It's a public client key, so it's safe to commit.
- Requests go through `/ingest`, proxied by `vercel.json` and, locally, by `vite.config.js`. That way ad blockers don't drop them.
- Automatic: pageviews (including route changes), clicks (autocapture), web vitals, JS errors. Session replay runs only if it's enabled in PostHog, and all inputs are masked.
- Custom events (every event carries `landing_version: "b"`):

| Event | Properties |
|---|---|
| `sample_note_expanded` | — |
| `booking_sheet_opened` | `source`: hero / bottom / sticky |
| `booking_form_invalid` | `fields` (names only, never values) |
| `checkout_started` | `child_class`, `has_email`, `amount`, `currency` |
| `checkout_failed` | `reason` |
| `payment_result` | `status`: paid / pending / failed / unknown, `order_id`, `amount`, `currency`, `revenue` (paid only) |

Never send names, phone numbers or emails to PostHog. Local dev sends nothing unless `VITE_POSTHOG_KEY` is set in `.env.local`.

## Changing the price
Set `SESSION_PRICE_INR` (whole rupees, e.g. `999`) in Vercel → Settings → Environment Variables, then redeploy.
The page labels, meta description and the amount charged by Cashfree all come from it. It defaults to 799.
A value that isn't a whole number fails the build, so a typo can't go live.

## Placeholders
- `VITE_SITE_URL` — canonical / og tags in `index.html` (production value in `.env.production`)
- `META_PIXEL_ID` — commented block in `index.html`
- Session details (dates, venue, price, WhatsApp) — `src/config.js`
