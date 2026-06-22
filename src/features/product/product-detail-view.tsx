"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
// import { motion } from "framer-motion"; // used by reviews section — restore when reviews are re-enabled
import { Minus, Plus, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import type { Product, Review } from "@/types";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useBarkleyStore } from "@/store/use-store";
import { toast } from "sonner";

type ProductDetailViewProps = {
  product: Product;
  reviews: Review[];
  related: Product[];
};

export function ProductDetailView({ product, reviews: _reviews, related }: ProductDetailViewProps) {
  const router = useRouter();
  const [imageIndex, setImageIndex] = useState(0);
  const [variantId, setVariantId] = useState(product.defaultVariantId);
  const [quantity, setQuantity] = useState(1);
  const [subscription, setSubscription] = useState(false);
  // ratingFilter — used only by the reviews section; restore when reviews are re-enabled
  // const [ratingFilter, setRatingFilter] = useState<number | "all">("all");

  const addToCart = useBarkleyStore((s) => s.addToCart);
  const toggleWishlist = useBarkleyStore((s) => s.toggleWishlist);
  const wishlistIds = useBarkleyStore((s) => s.wishlist.ids);

  const variant = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? product.variants[0],
    [product.variants, variantId],
  );

  const unitPrice = product.price + (variant?.priceModifier ?? 0);

  useEffect(() => {
    try {
      const key = "bb_recently_viewed";
      const prev = JSON.parse(window.localStorage.getItem(key) ?? "[]") as string[];
      const next = [product.slug, ...prev.filter((s) => s !== product.slug)].slice(0, 8);
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [product.slug]);

  // filteredReviews — used only by the reviews section; restore when reviews are re-enabled
  // const filteredReviews = useMemo(() => {
  //   if (ratingFilter === "all") return reviews;
  //   return reviews.filter((r) => r.rating === ratingFilter);
  // }, [ratingFilter, reviews]);

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast.error("This ritual is currently on waitlist.");
      return;
    }
    addToCart({ productId: product.id, variantId: variant.id, quantity });
    toast.success(`${product.name} · ${variant.label} added to cart`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-10 md:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-white shadow-premium ring-1 ring-white/70">
            <Image
              src={product.images[imageIndex] ?? product.images[0]}
              alt={product.name}
              fill
              priority
              className="object-cover transition duration-700 hover:scale-105"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {product.images.map((src, idx) => (
              <button
                key={src}
                type="button"
                onClick={() => setImageIndex(idx)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 ring-transparent transition ${
                  imageIndex === idx ? "ring-barkley-forest" : "hover:ring-barkley-sand"
                }`}
              >
                <Image src={src} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">{product.category}</p>
            <h1 className="font-display text-4xl text-barkley-cocoa md:text-5xl">{product.name}</h1>
            <p className="text-sm text-muted-foreground md:text-base">{product.tagline}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 ring-1 ring-border">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)} ({product.reviewCount}+ reviews)
              </span>
              {product.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-barkley-sand/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-barkley-cocoa"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-3">
            <p className="text-3xl font-semibold">{formatMoney(unitPrice)}</p>
            {product.compareAtPrice ? (
              <p className="pb-1 text-sm text-muted-foreground line-through">{formatMoney(product.compareAtPrice)}</p>
            ) : null}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Variant</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ring-1 ring-border transition ${
                    variant.id === v.id ? "bg-barkley-forest text-barkley-cream ring-barkley-forest" : "bg-white/80"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {product.subscriptionEligible ? (
            <div className="flex items-center justify-between rounded-3xl bg-white/80 p-4 text-xs shadow-soft ring-1 ring-white/70">
              <div>
                <p className="font-semibold uppercase tracking-[0.22em] text-muted-foreground">Subscribe & save</p>
                <p className="mt-1 text-[0.7rem] text-muted-foreground">
                  Never run out—pause, skip, or cancel anytime from your dashboard.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubscription((s) => !s)}
                className={`relative h-8 w-14 rounded-full transition ${
                  subscription ? "bg-barkley-forest" : "bg-barkley-sand"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-7 w-7 rounded-full bg-white shadow-soft transition ${
                    subscription ? "left-7" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ) : null}

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center rounded-full bg-white/80 p-1 ring-1 ring-border">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-barkley-sand/70"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-barkley-sand/70"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Qty reflects bags per delivery cycle.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="rounded-full px-8 text-xs font-semibold uppercase tracking-[0.2em]"
              disabled={!product.inStock}
              onClick={handleAddToCart}
            >
              Add to cart
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-8 text-xs font-semibold uppercase tracking-[0.2em]"
              disabled={!product.inStock}
              onClick={handleBuyNow}
            >
              Buy now
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-full px-6 text-xs font-semibold uppercase tracking-[0.2em]"
              onClick={() => {
                toggleWishlist(product.id);
                toast.message(wishlistIds.includes(product.id) ? "Removed from wishlist" : "Saved to wishlist");
              }}
            >
              Wishlist
            </Button>
          </div>

          <div className="grid gap-3 text-xs text-muted-foreground md:grid-cols-2">
            <div className="flex items-start gap-2 rounded-3xl bg-white/80 p-3 ring-1 ring-white/70">
              <Truck className="mt-0.5 h-4 w-4 text-barkley-forest" />
              <div>
                <p className="font-semibold text-barkley-cocoa">Delivery estimate</p>
                <p>Standard · arrives in 4–6 business days with carbon-offset logistics.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-3xl bg-white/80 p-3 ring-1 ring-white/70">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-barkley-forest" />
              <div>
                <p className="font-semibold text-barkley-cocoa">Shipping promise</p>
                <p>{product.shippingNote}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-8 rounded-[2rem] bg-white/85 p-6 shadow-soft ring-1 ring-white/70 md:grid-cols-3 md:p-8">
        <div className="space-y-3 md:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Ingredients</p>
          <ul className="space-y-1 text-sm text-barkley-cocoa/90">
            {product.ingredients.map((ing) => (
              <li key={ing} className="flex gap-2">
                <span className="mt-1 h-1 w-1 rounded-full bg-barkley-sage" />
                <span>{ing}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 md:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Nutrition highlights</p>
          <div className="space-y-2 text-sm">
            {product.nutritionFacts.map((fact) => (
              <div key={fact.label} className="flex items-center justify-between rounded-2xl bg-barkley-mist/60 px-3 py-2">
                <span className="text-muted-foreground">{fact.label}</span>
                <span className="font-semibold text-barkley-cocoa">{fact.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3 md:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Feeding guide</p>
          <p className="text-sm text-muted-foreground">{product.feedingGuide}</p>
          <p className="text-xs text-muted-foreground">{product.longDescription}</p>
        </div>
      </section>

      {/* REVIEWS SECTION — commented out; restore by un-commenting this block
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Reviews</p>
            <h2 className="mt-2 font-display text-3xl text-barkley-cocoa">Verified tail feedback</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
            {(["all", 5, 4, 3] as const).map((value) => (
              <button
                key={String(value)}
                type="button"
                onClick={() => setRatingFilter(value)}
                className={`rounded-full px-3 py-1 ring-1 ring-border ${
                  ratingFilter === value ? "bg-barkley-forest text-barkley-cream ring-barkley-forest" : "bg-white/80"
                }`}
              >
                {value === "all" ? "All ratings" : `${value} stars`}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {filteredReviews.map((review) => (
            <motion.article
              key={review.id}
              layout
              className="rounded-3xl bg-white/90 p-4 text-sm shadow-soft ring-1 ring-white/70"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-barkley-cocoa">{review.author}</p>
                  <p className="text-[0.65rem] text-muted-foreground">
                    {review.verified ? "Verified buyer" : "Community"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="mt-2 font-medium text-barkley-cocoa">{review.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{review.body}</p>
            </motion.article>
          ))}
        </div>
      </section>
      END REVIEWS SECTION */}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">You may also love</p>
            <h2 className="mt-2 font-display text-2xl text-barkley-cocoa">Related rituals</h2>
          </div>
          <Sparkles className="h-5 w-5 text-barkley-sage" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {related.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group overflow-hidden rounded-3xl bg-white/85 shadow-soft ring-1 ring-white/70 transition hover:-translate-y-1 hover:shadow-premium"
            >
              <div className="relative aspect-[4/3]">
                <Image src={p.images[0]} alt={p.name} fill className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="space-y-1 p-4">
                <p className="text-xs text-muted-foreground line-clamp-1">{p.tagline}</p>
                <p className="font-medium text-barkley-cocoa">{p.name}</p>
                <p className="text-sm font-semibold">{formatMoney(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
