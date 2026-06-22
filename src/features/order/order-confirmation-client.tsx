"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useBarkleyStore } from "@/store/use-store";

type SerializedOrder = {
  _id: string;
  orderNumber: string;
  status: string;
  email: string;
  items: {
    name: string;
    image: string;
    variantLabel: string;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
  };
  deliveryEstimate?: string;
};

export function OrderConfirmationClient({ order }: { order: SerializedOrder }) {
  const clearCart = useBarkleyStore((s) => s.clearCart);

  useEffect(() => {
    if (order.status === "paid") {
      clearCart();
    }
  }, [clearCart, order.status]);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-16 text-center md:px-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto flex max-w-md flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/30">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Order confirmed</p>
        <h1 className="font-display text-3xl text-barkley-cocoa md:text-4xl">Thank you for trusting Barkley.</h1>
        <p className="text-sm text-muted-foreground">
          Order <span className="font-semibold text-barkley-forest">{order.orderNumber}</span> is{" "}
          {order.status === "paid" ? "paid and queued for fulfillment" : "being finalized"}.
        </p>
      </motion.div>

      <div className="rounded-3xl bg-white/90 p-6 text-left text-sm shadow-soft ring-1 ring-white/70">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Delivery estimate</p>
        <p className="mt-1 text-barkley-cocoa">{order.deliveryEstimate ?? "4–6 business days"}</p>
        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
          <p className="font-semibold text-barkley-cocoa">{order.shippingAddress.fullName}</p>
          <p>
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
          </p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
          </p>
          <p>{order.shippingAddress.country}</p>
          <p className="pt-1">{order.shippingAddress.phone}</p>
          <p className="pt-1">{order.email}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white/90 p-6 text-left shadow-soft ring-1 ring-white/70">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Items</p>
        <div className="mt-4 space-y-3">
          {order.items.map((item, idx) => (
            <div key={`${item.name}-${idx}`} className="flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-medium text-barkley-cocoa">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.variantLabel} × {item.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold">{formatMoney(item.unitPrice * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-dashed border-border pt-4 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-barkley-cocoa">{formatMoney(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="font-medium text-barkley-cocoa">{formatMoney(order.shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span className="font-medium text-barkley-cocoa">{formatMoney(order.tax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discounts</span>
            <span className="font-medium text-barkley-cocoa">
              {order.discount ? `-${formatMoney(order.discount)}` : formatMoney(0)}
            </span>
          </div>
          <div className="flex justify-between pt-2 text-sm font-semibold text-barkley-cocoa">
            <span>Total</span>
            <span>{formatMoney(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/shop">
          <Button className="rounded-full px-8 text-xs font-semibold uppercase tracking-[0.2em]">Continue shopping</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-full px-8 text-xs font-semibold uppercase tracking-[0.2em]">
            View dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
