"use client";

import { useShallow } from "zustand/react/shallow";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Apple, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { shippingMethods } from "@/data/products";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCheckoutSession } from "@/actions/checkout";
import { selectActiveCartLines, useBarkleyStore } from "@/store/use-store";
import { products } from "@/data/products";
import { toast } from "sonner";

type Step = 0 | 1 | 2 | 3;

const steps = ["Shipping", "Delivery", "Payment", "Review"];

export function CheckoutView() {
  const lines = useBarkleyStore(useShallow((s) => s.cart.lines.filter((l) => !l.savedForLater)));

  const promoCode = useBarkleyStore((s) => s.promoCode);

  const [step, setStep] = useState<Step>(0);
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [shipping, setShipping] = useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    phone: "",
  });

  const [deliveryMethodId, setDeliveryMethodId] = useState<"standard" | "express" | "overnight">("standard");

  const computed = useMemo(() => {
    let subtotal = 0;
    for (const line of lines) {
      const product = products.find((p) => p.id === line.productId);
      if (!product) continue;
      const variant = product.variants.find((v) => v.id === line.variantId) ?? product.variants[0];
      const unit = product.price + (variant.priceModifier ?? 0);
      subtotal += unit * line.quantity;
    }
    const method = shippingMethods.find((m) => m.id === deliveryMethodId)!;
    const shipping = subtotal >= 75 && deliveryMethodId === "standard" ? 0 : method.price;

    const code = promoCode?.trim().toUpperCase() ?? "";
    let discount = 0;
    if (code === "WELCOME10") discount = subtotal * 0.1;
    if (code === "BARKLEY20") discount = Math.min(20, subtotal);
    discount = Math.min(discount, subtotal);

    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable * 0.07;
    const total = taxable + tax + shipping;
    return { subtotal, shipping, tax, discount, total, method };
  }, [deliveryMethodId, lines, promoCode]);

  const validateShipping = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email.");
      return false;
    }
    if (!shipping.fullName.trim()) {
      toast.error("Full name is required.");
      return false;
    }
    if (!shipping.line1.trim()) {
      toast.error("Street address is required.");
      return false;
    }
    if (!shipping.city.trim()) {
      toast.error("City is required.");
      return false;
    }
    if (!shipping.state.trim()) {
      toast.error("State / region is required.");
      return false;
    }
    if (!/^[0-9A-Za-z\s-]{3,10}$/.test(shipping.zip.trim())) {
      toast.error("ZIP / postal code looks invalid.");
      return false;
    }
    if (!shipping.country.trim()) {
      toast.error("Country is required.");
      return false;
    }
    if (shipping.phone.replace(/\D/g, "").length < 7) {
      toast.error("Please enter a valid phone number.");
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (step === 0 && !validateShipping()) return;
    setStep((s) => Math.min(3, (s + 1) as Step) as Step);
  };

  const goBack = () => setStep((s) => Math.max(0, (s - 1) as Step) as Step);

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    const res = await createCheckoutSession({
      email,
      shipping,
      deliveryMethodId,
      cartLines: lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        quantity: l.quantity,
        savedForLater: l.savedForLater,
      })),
      promoCode: promoCode ?? undefined,
    });
    setSubmitting(false);

    if ("error" in res) {
      toast.error(res.error);
      return;
    }

    window.location.href = res.url;
  };

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">Your cart is empty—let&apos;s find something delicious first.</p>
        <Link href="/shop">
          <Button className="rounded-full px-8 text-xs font-semibold uppercase tracking-[0.2em]">Browse shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 md:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Checkout</p>
          <h1 className="mt-2 font-display text-3xl text-barkley-cocoa md:text-4xl">A calm, confident purchase.</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Four deliberate steps, live validation, and Stripe-hosted payment—no brittle card mocks, just production
            patterns.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground shadow-soft ring-1 ring-white/70">
          <ShieldCheck className="h-4 w-4 text-barkley-forest" />
          Secure · Encrypted · Stripe
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)] lg:items-start">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-2 rounded-full bg-white/80 p-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground shadow-soft ring-1 ring-white/70">
            {steps.map((label, index) => (
              <div
                key={label}
                className={`flex-1 rounded-full px-3 py-2 text-center ${
                  index === step ? "bg-barkley-forest text-barkley-cream" : ""
                }`}
              >
                {index + 1}. {label}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl bg-white/90 p-6 shadow-soft ring-1 ring-white/70 md:p-8"
            >
              {step === 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="fullName">Full name</Label>
                      <Input id="fullName" value={shipping.fullName} onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="line1">Address</Label>
                      <Input id="line1" value={shipping.line1} onChange={(e) => setShipping({ ...shipping, line1: e.target.value })} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="line2">Apartment / suite (optional)</Label>
                      <Input id="line2" value={shipping.line2} onChange={(e) => setShipping({ ...shipping, line2: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP code</Label>
                      <Input id="zip" value={shipping.zip} onChange={(e) => setShipping({ ...shipping, zip: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} />
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Choose how quickly Barkley arrives at your door.</p>
                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setDeliveryMethodId(method.id as typeof deliveryMethodId)}
                        className={`flex w-full items-start justify-between rounded-3xl border px-4 py-3 text-left text-sm transition ${
                          deliveryMethodId === method.id
                            ? "border-barkley-forest bg-barkley-mist/60"
                            : "border-border bg-white/70 hover:border-barkley-sage/60"
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-barkley-cocoa">{method.label}</p>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                          <p className="mt-1 text-[0.65rem] text-muted-foreground">
                            ETA {method.etaDays[0]}–{method.etaDays[1]} business days
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {method.price === 0 && computed.subtotal >= 75 && method.id === "standard"
                            ? "Included"
                            : formatMoney(method.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Barkley Bites uses{" "}
                    <span className="font-semibold text-barkley-forest">Stripe Checkout</span> for PCI-grade payments.
                    Apple Pay, Google Pay, Link, and major cards are available depending on your device and region.
                  </p>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="flex flex-col items-center justify-center rounded-3xl bg-barkley-mist/60 p-4 text-center text-xs">
                      <CreditCard className="mb-2 h-5 w-5 text-barkley-forest" />
                      <p className="font-semibold text-barkley-cocoa">Cards</p>
                      <p>Visa, Mastercard, Amex, Discover</p>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-3xl bg-barkley-mist/60 p-4 text-center text-xs">
                      <Apple className="mb-2 h-5 w-5 text-barkley-forest" />
                      <p className="font-semibold text-barkley-cocoa">Apple Pay</p>
                      <p>Where supported by Safari & Stripe</p>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-3xl bg-barkley-mist/60 p-4 text-center text-xs">
                      <ShieldCheck className="mb-2 h-5 w-5 text-barkley-forest" />
                      <p className="font-semibold text-barkley-cocoa">Fraud protection</p>
                      <p>Radar, 3DS, and SCA-aware flows</p>
                    </div>
                  </div>

                  {/* Venmo — placeholder until a PayPal Business account with
                      enable-funding=venmo is configured. Intentionally disabled
                      rather than wired to anything fake, so it never misleads
                      a customer into thinking it works today. */}
                  <div className="flex items-center justify-between gap-3 rounded-3xl border border-dashed border-barkley-clay/60 bg-barkley-sand/30 px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-barkley-cocoa">Pay with Venmo</p>
                      <p className="text-[0.65rem] text-muted-foreground">Coming soon — card payment is required for now.</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" disabled className="rounded-full text-[0.65rem] uppercase tracking-[0.16em]">
                      Coming soon
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-barkley-cocoa">You&apos;re about to be redirected to Stripe.</p>
                  <p>
                    We&apos;ll create a live payment session with your exact items, shipping, and tax estimate. When payment
                    succeeds, you&apos;ll land on a cinematic confirmation screen with your Barkley order number.
                  </p>
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <Button type="button" variant="outline" className="rounded-full text-xs uppercase tracking-[0.18em]" disabled={step === 0} onClick={goBack}>
                  Back
                </Button>
                {step < 3 ? (
                  <Button type="button" className="rounded-full px-8 text-xs uppercase tracking-[0.18em]" onClick={goNext}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="rounded-full px-8 text-xs uppercase tracking-[0.18em]"
                    disabled={submitting}
                    onClick={handlePlaceOrder}
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing secure checkout…
                      </span>
                    ) : (
                      "Place order & pay securely"
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="space-y-4 rounded-3xl bg-white/95 p-6 shadow-premium ring-1 ring-white/80 lg:sticky lg:top-28">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Order summary</p>
          <div className="space-y-3 text-sm">
            {lines.map((line) => {
              const product = products.find((p) => p.id === line.productId);
              if (!product) return null;
              const variant = product.variants.find((v) => v.id === line.variantId) ?? product.variants[0];
              const unit = product.price + (variant.priceModifier ?? 0);
              return (
                <div key={`${line.productId}-${line.variantId}`} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-barkley-cocoa">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {variant.label} × {line.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{formatMoney(unit * line.quantity)}</p>
                </div>
              );
            })}
          </div>
          <div className="space-y-2 border-t border-dashed border-border pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium text-barkley-cocoa">{formatMoney(computed.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Discount (est.)</span>
              <span className="font-medium text-barkley-cocoa">
                {computed.discount ? `-${formatMoney(computed.discount)}` : formatMoney(0)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="font-medium text-barkley-cocoa">
                {computed.shipping === 0 ? "Included" : formatMoney(computed.shipping)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (est.)</span>
              <span className="font-medium text-barkley-cocoa">{formatMoney(computed.tax)}</span>
            </div>
            {promoCode ? (
              <div className="flex justify-between text-xs text-barkley-forest">
                <span>Promo</span>
                <span className="font-semibold uppercase tracking-[0.16em]">{promoCode}</span>
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-between border-t border-dashed border-border pt-4 text-base font-semibold">
            <span>Total due</span>
            <span>{formatMoney(computed.total)}</span>
          </div>
          <p className="text-[0.65rem] text-muted-foreground">
            Final tax may adjust slightly based on jurisdiction; any delta will be reflected on your Stripe receipt and
            Barkley order record.
          </p>
        </aside>
      </div>
    </div>
  );
}
