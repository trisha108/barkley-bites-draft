"use client";

import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useBarkleyStore } from "@/store/use-store";
import { toast } from "sonner";

export function WishlistView() {
  const ids = useBarkleyStore((s) => s.wishlist.ids);
  const toggleWishlist = useBarkleyStore((s) => s.toggleWishlist);
  const addToCart = useBarkleyStore((s) => s.addToCart);

  const items = products.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 md:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Wishlist</p>
        <h1 className="mt-2 font-display text-3xl text-barkley-cocoa md:text-4xl">Saved for the perfect moment.</h1>
      </div>

      {!items.length ? (
        <div className="rounded-3xl bg-white/85 p-10 text-center text-sm text-muted-foreground shadow-soft ring-1 ring-white/70">
          No saved products yet. Tap the heart from shop or product pages to curate your list.
          <div className="mt-4">
            <Link href="/shop">
              <Button className="rounded-full px-8 text-xs font-semibold uppercase tracking-[0.2em]">Browse shop</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((product) => (
            <div key={product.id} className="flex gap-4 rounded-3xl bg-white/90 p-4 shadow-soft ring-1 ring-white/70">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl">
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">{product.tagline}</p>
                  <Link href={`/product/${product.slug}`} className="font-display text-lg text-barkley-cocoa hover:underline">
                    {product.name}
                  </Link>
                  <p className="text-sm font-semibold">{formatMoney(product.price)}</p>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full text-[0.65rem]"
                    disabled={!product.inStock}
                    onClick={() => {
                      addToCart({ productId: product.id, variantId: product.defaultVariantId, quantity: 1 });
                      toast.success("Moved to cart");
                    }}
                  >
                    Add to cart
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full text-[0.65rem]"
                    onClick={() => {
                      toggleWishlist(product.id);
                      toast.message("Removed from wishlist");
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
