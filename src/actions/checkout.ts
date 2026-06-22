"use server";

import { z } from "zod";
import type Stripe from "stripe";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { CouponModel, OrderModel } from "@/models";
import { products, shippingMethods } from "@/data/products";
import { generateOrderNumber } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";

const addressSchema = z.object({
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().regex(/^[0-9A-Za-z\s-]{3,10}$/),
  country: z.string().min(2),
  phone: z.string().min(7),
});

const checkoutSchema = z.object({
  email: z.string().email(),
  shipping: addressSchema,
  deliveryMethodId: z.enum(["standard", "express", "overnight"]),
  cartLines: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().positive(),
        savedForLater: z.boolean().optional(),
      }),
    )
    .min(1),
  promoCode: z.string().optional(),
});

export type CheckoutPayload = z.infer<typeof checkoutSchema>;

export async function createCheckoutSession(payload: unknown): Promise<{ url: string } | { error: string }> {
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Please double-check your shipping details." };
  }

  const activeLines = parsed.data.cartLines.filter((l) => !l.savedForLater);
  if (!activeLines.length) {
    return { error: "Your cart is empty." };
  }

  let subtotal = 0;
  const items: {
    productId: string;
    slug?: string;
    name: string;
    image: string;
    variantId: string;
    variantLabel: string;
    quantity: number;
    unitPrice: number;
    subscription: boolean;
  }[] = [];

  for (const line of activeLines) {
    const product = products.find((p) => p.id === line.productId);
    if (!product || !product.inStock) {
      return { error: "One or more items are no longer available." };
    }
    const variant = product.variants.find((v) => v.id === line.variantId) ?? product.variants[0];
    const unit = product.price + (variant.priceModifier ?? 0);
    subtotal += unit * line.quantity;
    items.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      variantId: variant.id,
      variantLabel: variant.label,
      quantity: line.quantity,
      unitPrice: unit,
      subscription: false,
    });
  }

  let discount = 0;
  const promo = parsed.data.promoCode?.trim().toUpperCase();
  if (promo) {
    let handled = false;
    try {
      await connectDB();
      const coupon = await CouponModel.findOne({ code: promo, active: true });
      if (coupon) {
        handled = true;
        if (coupon.minSpend && subtotal < coupon.minSpend) {
          return { error: "This promo code requires a higher subtotal." };
        }
        if (coupon.type === "percent") {
          discount = subtotal * (coupon.amount / 100);
        } else {
          discount = coupon.amount;
        }
      }
    } catch {
      // fall through to static promos
    }

    if (!handled) {
      if (promo === "WELCOME10") discount = subtotal * 0.1;
      if (promo === "BARKLEY20") discount = Math.min(20, subtotal);
    }

    discount = Math.min(discount, subtotal);
  }

  const method = shippingMethods.find((m) => m.id === parsed.data.deliveryMethodId);
  if (!method) {
    return { error: "Invalid shipping method." };
  }

  const shipping = subtotal >= 75 && method.id === "standard" ? 0 : method.price;
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * 0.07;
  const total = taxable + tax + shipping;

  await connectDB();
  const sessionUser = await auth();

  const shippingAddress = {
    fullName: parsed.data.shipping.fullName,
    line1: parsed.data.shipping.line1,
    line2: parsed.data.shipping.line2,
    city: parsed.data.shipping.city,
    state: parsed.data.shipping.state,
    zip: parsed.data.shipping.zip,
    country: parsed.data.shipping.country,
    phone: parsed.data.shipping.phone,
  };

  const order = await OrderModel.create({
    user: sessionUser?.user?.id,
    email: parsed.data.email,
    orderNumber: generateOrderNumber(),
    status: "pending",
    items,
    subtotal,
    shipping,
    tax,
    discount,
    total,
    shippingAddress,
    deliveryMethodId: method.id,
    promoCode: promo,
    deliveryEstimate: `${method.etaDays[0]}–${method.etaDays[1]} business days`,
  });

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const adjustedRatio = subtotal === 0 ? 1 : (subtotal - discount) / subtotal;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = activeLines.map((line) => {
    const product = products.find((p) => p.id === line.productId)!;
    const variant = product.variants.find((v) => v.id === line.variantId) ?? product.variants[0];
    const unit = (product.price + (variant.priceModifier ?? 0)) * adjustedRatio;
    const unitCents = Math.max(50, Math.round(unit * 100));
    return {
      quantity: line.quantity,
      price_data: {
        currency: "usd",
        unit_amount: unitCents,
        product_data: {
          name: `${product.name} · ${variant.label}`,
          metadata: {
            productId: product.id,
            variantId: variant.id,
          },
        },
      },
    };
  });

  if (shipping > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(shipping * 100),
        product_data: {
          name: `Shipping · ${method.label}`,
        },
      },
    });
  }

  if (tax > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(tax * 100),
        product_data: {
          name: "Estimated tax",
        },
      },
    });
  }

  try {
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: parsed.data.email,
      line_items: lineItems,
      success_url: `${appUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout`,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    if (!stripeSession.url) {
      return { error: "Unable to start hosted checkout." };
    }

    order.stripeCheckoutSessionId = stripeSession.id;
    await order.save();

    return { url: stripeSession.url };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Stripe checkout failed." };
  }
}
