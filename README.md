# iWear Sunglasses — Headless Shopify Storefront

Premium sunglasses e-commerce for **iWear Sunglasses**, based in Bali. Built with Next.js and the Shopify Storefront API.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4**
- **Shopify Storefront API** via `@shopify/storefront-api-client`
- **Vercel Analytics** + optional GA4

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Shopify

1. Create a [Shopify store](https://www.shopify.com) and set your business location to Indonesia.
2. In **Shopify Admin → Settings → Apps and sales channels → Develop apps**, create a custom app.
3. Configure **Storefront API** scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_write_customers`
   - `unauthenticated_read_customers`
4. Install the app and copy the **Storefront API access token**.
5. Under **Settings → Customer accounts**, enable **Classic customer accounts** (email/password) so storefront login works.

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in your credentials (see `.env.example`). Optionally set `NEXT_PUBLIC_WHATSAPP_URL` to a real `https://wa.me/62…` link (or bare number).

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/                 # Routes (shop, brands, PDP, cart, account, legal)
├── components/          # UI (header, catalog, cart, wishlist, account, SEO)
└── lib/
    ├── shopify/         # Storefront API client, cart, customer, queries
    ├── site.ts          # Brand & store config
    └── format.ts        # Price formatting (IDR)
```

## Shopify Admin go-live checklist

Complete these in Shopify Admin before taking real orders — they are not controlled by this repo:

- [ ] **Payments** — enable Shopify Payments / local methods for Indonesia
- [ ] **Shipping** — zones + rates for Bali, rest of Indonesia, and international
- [ ] **Taxes** — Indonesia tax settings as needed
- [ ] **Domain** — connect custom domain; set `NEXT_PUBLIC_SITE_URL` to the public URL
- [ ] **Transactional email** — sender domain / branding for order + abandoned-checkout emails
- [ ] **Customer accounts** — Classic accounts enabled (see scopes above)
- [ ] **Catalog data** — per-SKU `specs.front_colour` / `specs.lens_color` (today the storefront prefers title/description because group-level metafields are unreliable)
- [ ] **Reviews app** (optional) — Judge.me, Loox, or Shopify Product Reviews; expose rating metafields under `reviews.rating` + `reviews.rating_count`
- [ ] **WhatsApp** — set `NEXT_PUBLIC_WHATSAPP_URL`

## Storefront features

- [x] Cart state and checkout via Storefront API
- [x] Customer login, signup, order history (Classic Customer Access Token)
- [x] Cart discount codes
- [x] Inventory quantity messaging (`quantityAvailable`)
- [x] Product JSON-LD, per-page canonicals, analytics
- [ ] Configure custom domain and deploy (Vercel recommended)
- [ ] Set up Shopify payments for Indonesia
- [ ] Set `NEXT_PUBLIC_WHATSAPP_URL` to the store WhatsApp number

## Scripts

| Command       | Description          |
|---------------|----------------------|
| `npm run dev` | Start dev server     |
| `npm run build` | Production build   |
| `npm run start` | Production start   |
| `npm run lint`  | Run ESLint         |
