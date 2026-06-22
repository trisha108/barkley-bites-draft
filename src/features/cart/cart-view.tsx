"use client";

import { useShallow } from "zustand/react/shallow";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { products } from "@/data/products";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useBarkleyStore,
} from "@/store/use-store";
import { toast } from "sonner";

function findProduct(productId: string) {
  return products.find((p) => p.id === productId);
}

export function CartView() {
  // Prevent Zustand localStorage hydration mismatch: SSR renders empty cart;
  // client immediately reads from localStorage. Without this guard React 18
  // detects the DOM difference and can drop the component tree (blank page).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = useBarkleyStore(useShallow((s) => s.cart.lines.filter((l) => !l.savedForLater)));
  const saved = useBarkleyStore(useShallow((s) => s.cart.lines.filter((l) => l.savedForLater)));
  const updateQuantity = useBarkleyStore((s) => s.updateQuantity);
  const removeFromCart = useBarkleyStore((s) => s.removeFromCart);
  const toggleSavedForLater = useBarkleyStore((s) => s.toggleSavedForLater);
  const moveSavedToCart = useBarkleyStore((s) => s.moveSavedToCart);
  const promoCode = useBarkleyStore((s) => s.promoCode);
  const applyPromoLocal = useBarkleyStore((s) => s.applyPromoLocal);

  const computed = useMemo(() => {
    let subtotal = 0;
    for (const line of lines) {
      const product = findProduct(line.productId);
      if (!product) continue;
      const variant = product.variants.find((v) => v.id === line.variantId) ?? product.variants[0];
      const unit = product.price + (variant?.priceModifier ?? 0);
      subtotal += unit * line.quantity;
    }
    const shippingEstimate = subtotal >= 75 ? 0 : 8;
    const taxEstimate = subtotal * 0.07;
    const discount = 0;
    const total = subtotal + shippingEstimate + taxEstimate - discount;
    return { subtotal, shippingEstimate, taxEstimate, discount, total };
  }, [lines]);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8">
        <div className="h-8 w-48 rounded-2xl bg-barkley-sand/40 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 md:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Cart</p>
        <h1 className="mt-2 font-display text-3xl text-barkley-cocoa md:text-4xl">Your ritual, itemized.</h1>
      </div>

      {lines.length === 0 && saved.length === 0 ? (
        <div className="rounded-3xl bg-white/85 p-10 text-center shadow-soft ring-1 ring-white/70">
          <p className="text-sm text-muted-foreground">Your cart is resting—let&apos;s fill it with something extraordinary.</p>
          <Link href="/shop" className="mt-4 inline-flex">
            <Button className="rounded-full px-8 text-xs font-semibold uppercase tracking-[0.2em]">Continue shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
          <div className="space-y-4">
            {lines.map((line) => {
              const product = findProduct(line.productId);
              if (!product) return null;
              const variant = product.variants.find((v) => v.id === line.variantId) ?? product.variants[0];
              const unit = product.price + (variant?.priceModifier ?? 0);
              return (
                <motion.div
                  layout
                  key={`${line.productId}-${line.variantId}`}
                  className="flex gap-4 rounded-3xl bg-white/85 p-4 shadow-soft ring-1 ring-white/70"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">{variant.label}</p>
                        <p className="font-display text-lg text-barkley-cocoa">{product.name}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatMoney(unit * line.quantity)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="inline-flex items-center rounded-full bg-barkley-mist/70 p-1">
                        <button
                          type="button"
                          className="h-8 w-8 rounded-full hover:bg-white/80"
                          onClick={() => updateQuantity(line.productId, line.variantId, line.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{line.quantity}</span>
                        <button
                          type="button"
                          className="h-8 w-8 rounded-full hover:bg-white/80"
                          onClick={() => updateQuantity(line.productId, line.variantId, line.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-barkley-forest"
                        onClick={() => toggleSavedForLater(line.productId, line.variantId)}
                      >
                        Save for later
                      </button>
                      <button
                        type="button"
                        className="ml-auto inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-destructive hover:text-destructive/80"
                        onClick={() => removeFromCart(line.productId, line.variantId)}
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {saved.length ? (
              <div className="space-y-3 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Saved for later</p>
                {saved.map((line) => {
                  const product = findProduct(line.productId);
                  if (!product) return null;
                  const variant = product.variants.find((v) => v.id === line.variantId) ?? product.variants[0];
                  return (
                    <div
                      key={`saved-${line.productId}-${line.variantId}`}
                      className="flex items-center justify-between rounded-3xl bg-white/60 px-4 py-3 text-sm ring-1 ring-border/60"
                    >
                      <div>
                        <p className="font-medium text-barkley-cocoa">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{variant.label}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full text-[0.65rem]"
                        onClick={() => moveSavedToCart(line.productId, line.variantId)}
                      >
                        Move to cart
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <aside className="space-y-4 rounded-3xl bg-white/90 p-6 shadow-premium ring-1 ring-white/70 lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-barkley-cocoa">{formatMoney(computed.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping (est.)</span>
                <span className="font-medium text-barkley-cocoa">
                  {computed.shippingEstimate === 0 ? "Complimentary" : formatMoney(computed.shippingEstimate)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (est.)</span>
                <span className="font-medium text-barkley-cocoa">{formatMoney(computed.taxEstimate)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Promo code</p>
              <div className="flex gap-2">
                <Input
                  className="h-10 rounded-2xl"
                  placeholder="WELCOME10"
                  defaultValue={promoCode ?? ""}
                  onBlur={(e) => applyPromoLocal(e.target.value || null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() => toast.message("Promos are validated again at checkout with your full address.")}
                >
                  Apply
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-dashed border-border pt-4 text-base font-semibold">
              <span>Estimated total</span>
              <span>{formatMoney(computed.total)}</span>
            </div>
            <Link href="/checkout" className="block">
              <Button className="mt-2 w-full rounded-full text-xs font-semibold uppercase tracking-[0.2em]" disabled={lines.length === 0}>
                Checkout
              </Button>
            </Link>
            <Link href="/shop" className="block text-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-barkley-forest">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
