# Data Storage Audit — Barkley Bites

Generated: 2026-05-14

---

## 1. Products

| Layer | Mechanism | Details |
|-------|-----------|---------|
| **Primary store** | Hardcoded static file | `src/data/products.ts` exports a `products: Product[]` array that is imported directly wherever product data is needed. |
| **Database** | Not stored in MongoDB | There is a `src/models/Product.ts` Mongoose model defined, but no API route writes product documents and no page reads them from the database. All product data is compile-time static. |
| **Client state** | None | Products are never placed in Zustand or localStorage. |

**Consequence**: Changing a product name or price requires editing `src/data/products.ts` and redeploying. The Mongoose `Product` model is available for a future migration to a database-driven catalog.

---

## 2. Cart Items

| Layer | Mechanism | Details |
|-------|-----------|---------|
| **Primary store** | Zustand + `persist` → `localStorage` | `src/store/use-store.ts` creates `useBarkleyStore` with the `persist` middleware. The `cart.lines: CartLine[]` slice is persisted under the key `"barkley-bites-store"` in `localStorage`. |
| **Database** | Not stored in MongoDB | There is a `src/models/Cart.ts` Mongoose model defined, but it is never written to during normal shopping. Cart lives entirely in the browser. |
| **Server** | Never sent to the server until checkout | Cart lines are passed as a payload to the `createCheckoutSession` server action only when the user clicks "Place order & pay securely." |

**Cart state shape (localStorage)**:
```json
{
  "cart": {
    "lines": [
      { "productId": "p1", "variantId": "3oz", "quantity": 2, "savedForLater": false }
    ]
  },
  "wishlist": { "ids": [] },
  "recentSearches": [],
  "promoCode": null
}
```

**SSR hydration note**: Because `localStorage` is not available during server-side rendering, Zustand initializes with an empty cart on the server. The client re-hydrates from `localStorage` after mount. A `mounted` guard in `CartView` and `CheckoutView` prevents the resulting DOM mismatch from crashing the page (see Goal 5 fix).

---

## 3. Checkout Details

| Layer | Mechanism | Details |
|-------|-----------|---------|
| **During form entry** | Local React `useState` | In `src/features/checkout/checkout-view.tsx`, `email`, `shipping`, and `deliveryMethodId` are held in component state. They are **not persisted** between page reloads. |
| **Promo code** | Zustand + localStorage | `promoCode` is part of the Zustand store and survives page reloads. |
| **After submission** | MongoDB (`Order` document) | `src/actions/checkout.ts` calls `OrderModel.create()` to write a full order record to MongoDB before redirecting to Stripe. Fields include: email, shipping address, cart line snapshots, subtotal, shipping, tax, discount, total, delivery method, and Stripe checkout session ID. |
| **After payment** | MongoDB (`Order` + `Payment` documents) | The Stripe webhook at `src/app/api/stripe/webhook/route.ts` receives `checkout.session.completed`, updates `order.status = "paid"`, and upserts a `Payment` document with the `stripePaymentIntentId`. |
| **Stripe** | Stripe-hosted session | Payment card data never touches this server. Stripe Checkout handles PCI scope. |

**Order document shape (MongoDB)**:
```
orderNumber, status, email, items[], subtotal, shipping, tax, discount,
total, shippingAddress, deliveryMethodId, promoCode, stripeCheckoutSessionId,
stripePaymentIntentId, deliveryEstimate, createdAt
```

---

## 4. Subscription Selections

| Layer | Mechanism | Details |
|-------|-----------|---------|
| **Plan catalog** | Hardcoded static file | `src/data/products.ts` exports `subscriptionPlans: SubscriptionPlan[]` — three tiers at $39/mo, $59/mo, $89/mo. This is static compile-time data, not from a database. |
| **User selection (pre-purchase)** | Not persisted | The subscriptions page (`src/app/subscriptions/page.tsx`) shows plans; clicking "Start with this plan" links to `/checkout`. No selection state is stored. |
| **Active subscriptions** | MongoDB (`Subscription` model) | `src/models/Subscription.ts` defines a Mongoose schema with fields: `user`, `plan`, `status` (active/paused/cancelled), `stripeSubscriptionId`, `skipCount`, etc. The server actions in `src/actions/subscriptions.ts` (pause, resume, skip, cancel) read and write this collection. |
| **Stripe Billing** | Stripe (wired but partial) | The subscription server actions have stub comments (`// Wire Stripe: stripe.subscriptions.update(...)`) indicating Stripe Billing integration is planned but not yet fully wired. Status updates currently only write to MongoDB. |

---

## Summary Table

| Data | localStorage | MongoDB | Zustand | Static file | API call |
|------|:---:|:---:|:---:|:---:|:---:|
| Products | – | – | – | ✓ | – |
| Cart items | ✓ (via Zustand persist) | – | ✓ | – | – |
| Checkout form fields | – | – | – | – | – (React state only) |
| Promo code | ✓ (via Zustand persist) | – | ✓ | – | – |
| Placed orders | – | ✓ | – | – | ✓ (server action) |
| Active subscriptions | – | ✓ | – | – | ✓ (server actions) |
| Subscription plan catalog | – | – | – | ✓ | – |
| Wishlist | ✓ (via Zustand persist) | – | ✓ | – | – |
