# Barkley Bites

Premium ecommerce for dog treats & pet wellness, built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **MongoDB + Mongoose**, **NextAuth.js**, **Stripe Checkout**, **Resend**, and **Cloudinary-ready** helpers.

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Environment variables

Create `.env.local` (see `.env.example` for all keys):

- **AUTH_SECRET** / **AUTH_URL** – NextAuth v5 (`AUTH_URL` should match your local or Vercel deployment URL).
- **MONGODB_URI** – MongoDB Atlas connection string.
- **STRIPE_SECRET_KEY**, **STRIPE_WEBHOOK_SECRET**, **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** – Stripe test mode.
- **NEXT_PUBLIC_APP_URL** – Public site URL used for Stripe success/cancel redirects.
- **RESEND_API_KEY**, **RESEND_FROM**, **RESEND_CONTACT_TO** – Transactional email (orders, password reset, contact form).
- **GOOGLE_CLIENT_ID**, **GOOGLE_CLIENT_SECRET** – Optional Google OAuth.
- **CLOUDINARY_CLOUD_NAME** (+ API keys if uploading server-side).

## Database seed

```bash
npm run seed
```

Seeds categories, products, reviews, and coupons into MongoDB using `scripts/seed-products.ts`.

## Stripe webhooks

Point a Stripe CLI or dashboard webhook to:

`/api/stripe/webhook`

Use the signing secret as `STRIPE_WEBHOOK_SECRET`.

## Deployment

Optimized for **Vercel**:

- Configure all environment variables in the Vercel project.
- Ensure `AUTH_URL` / `NEXT_PUBLIC_APP_URL` match the production domain.
