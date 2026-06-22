export type DogSize = "small" | "medium" | "large" | "all";

export type ProductCategory = "treats" | "wellness" | "supplements" | "bundles";

export interface ProductVariant {
  id: string;
  label: string;
  priceModifier?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: ProductCategory;
  flavors: string[];
  dogSizes: DogSize[];
  dietary: string[];
  rating: number;
  reviewCount: number;
  badges: string[];
  inStock: boolean;
  subscriptionEligible: boolean;
  variants: ProductVariant[];
  defaultVariantId: string;
  nutritionFacts: { label: string; value: string }[];
  ingredients: string[];
  feedingGuide: string;
  shippingNote: string;
}

export interface CartLine {
  productId: string;
  variantId: string;
  quantity: number;
  savedForLater?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  avatarUrl: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  perks: string[];
  badge?: string;
}

export interface ShippingMethod {
  id: string;
  label: string;
  description: string;
  price: number;
  etaDays: [number, number];
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Address {
  id: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  image: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: Address;
  email: string;
  deliveryMethodId: string;
  promoCode?: string;
}

export interface CheckoutPayment {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  billingSameAsShipping: boolean;
  billingAddress?: Address;
}
