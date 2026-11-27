# Ibrahim's Family Collection — Online Store

Family clothing store for **Ibrahim's Family Collection**, Faisalabad — Men / Women / Kids / Abaya, since 2015. Light-mode stitched theme (like MTJ / Nishat Linen), Cash on Delivery checkout.

- **Store:** ABC Road, Near Ideal Bakery, Gulfishan Colony, Faisalabad, Pakistan
- **Phone:** 0321-0066789 · **Email:** info@ibrahimsfc.com
- **Hours:** 10:00 AM to 8:00 PM Mon–Sat, closed Sundays
- **Facebook:** https://www.facebook.com/ibrahimsfc.official/ (2,580 followers)
- **Website:** ibrahimsfc.com
- No verified Instagram / YouTube / TikTok — those fields are intentionally blank in Settings.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the production build
```

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project → import the repo**. Framework preset: Next.js. No environment variables are required.
3. Deploy. The storefront is at `/`, the admin panel at `/admin`.

## What's inside

- `app/page.tsx` — homepage: full-bleed hero, ticker, categories, New Winter Arrivals, Best Buys Under PKR 999 (includes PKR 999 exactly), Style Steals Under PKR 1,999, shop-all call to action.
- `app/shop/page.tsx` — full catalog with search, category + price filters and sorting.
- `app/category/[slug]/page.tsx` — Women / Men / Kids / Abaya category pages.
- `app/product/[id]/page.tsx` — product detail: large photo, sizes, colours, stock, quantity, related products.
- `app/about/page.tsx` — brand story (serving Faisalabad since 2015; only real facts).
- `app/contact/page.tsx` — store address, phone, email, hours, Facebook, plus a front-end-only contact form.
- `app/wishlist/page.tsx` — saved items (localStorage `ifc_wishlist`).
- `app/checkout/page.tsx` — dedicated COD checkout page (order summary + delivery form → POST /api/orders).
- `app/track/page.tsx` — track an order by ID (GET /api/orders/[id], plus the browser's `ifc_orders` mirror as fallback).
- `lib/site.tsx` — shared storefront shell: ShopProvider (cart in localStorage `ifc_cart`, wishlist), slim navy header, bag drawer, extensive footer, product cards.
- `app/admin/page.tsx` — admin: sales dashboard, products (add/edit/delete), orders (status Pending → Confirmed → Shipped → Delivered / Cancelled), customers, settings.
- `lib/products.ts` — the 24-product catalog. **Only one product is real** (Men's Fleece Cargo Trousers, PKR 2,199, was PKR 2,799); the other 23 are clearly labelled sample listings — edit or replace them in Admin or in this file.
- `lib/logo-data.ts` — the brand logo as a base64 data URI (UTF-8 text). The logo PNG itself is **not** in this repo: the git snapshot push used for deployment accepts text files only, so the binary logo is embedded as text instead. `public/logo.png` is git-ignored as a reminder.
- `lib/store.ts` — server-side JSON store.

## API

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/products` | GET / POST | List / add products |
| `/api/products/[id]` | PUT / DELETE | Edit / delete a product |
| `/api/orders` | GET / POST | List orders / place an order (id like `IFC-XXXXXX`, decrements stock) |
| `/api/orders/[id]` | GET / PATCH | Look up one order / change order status |
| `/api/settings` | GET / PUT | Store settings |

Delivery is PKR 250, **free on orders over PKR 5,000**.

## Storage — read this before going live

**There is no external database connected yet.** This is a documented fallback:

- Orders, product edits and settings live in the server's module memory, persisted best-effort to `/tmp/ifc-store.json` when writable.
- Placed orders are **also mirrored into the customer's browser localStorage** (key `ifc_orders`), and the Admin Orders tab merges API orders + that browser mirror, deduped by order id — so the owner still sees orders in the same browser even if the server instance recycles.
- On Vercel, serverless functions are stateless and ephemeral: a cold start or a new instance can lose in-memory data, and `/tmp` does not persist between instances. Edits and orders survive within a warm instance and in the browser mirror, but they are **not durable**.

**Upgrade path (when ready):** Vercel Dashboard → Storage → create a Postgres (or KV) database → set `DATABASE_URL` in the project → swap the `lib/store.ts` adapter for real database calls. No other code needs to change — the API routes and the admin already talk to `lib/store.ts` only.
