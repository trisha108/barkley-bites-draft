"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { products } from "@/data/products";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useBarkleyStore } from "@/store/use-store";
import { toast } from "sonner";
import { OnboardingQuestionModal } from "@/components/OnboardingQuestionModal";

const featuredProducts = products.slice(0, 4);

// One-line differentiator per product slug — keeps copy honest and specific
// rather than generic marketing language.
const PRODUCT_TAGLINES: Record<string, string> = {
  "jerky-treats-3oz": "Hand-baked, slow-dehydrated, 100% salmon",
  "original-salmon-mix-8oz": "Seafood-first, made fresh weekly",
  "original-salmon-veggie-mix-8oz": "4-day fresh, zero fillers",
  "waggin-tails": "Small batch, hand-mixed",
};

export function HomePage() {
  const addToCart = useBarkleyStore((s) => s.addToCart);

  const handleQuickAdd = (productId: string, variantId: string, name: string) => {
    addToCart({ productId, variantId, quantity: 1 });
    toast.success(`${name} added to your cart`);
  };

  return (
    <div>
      <OnboardingQuestionModal />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-barkley-mist/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">
              Gourmet for your pup. Good for the planet.
            </p>
            <h1 className="font-display text-4xl leading-tight text-barkley-cocoa md:text-5xl">
              &ldquo;Happy dogs start with a lot of love, a lot of physical entertainment,
              and a healthy balanced diet.&rdquo;
            </h1>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              — Schuyler Ford, Founder
            </p>
            <p className="max-w-md text-base text-muted-foreground">
              Human-grade, small-batch meals made fresh weekly from rescued, local seafood.
              No preservatives. No fillers. Just real food, made the way you&apos;d cook for your own dog.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/shop">
                <Button className="rounded-full px-8 text-xs font-semibold uppercase tracking-[0.2em]">
                  Shop the meals
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" className="rounded-full px-8 text-xs font-semibold uppercase tracking-[0.2em]">
                  Our story
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 text-xs font-semibold uppercase tracking-[0.14em] text-barkley-forest">
              <span>No preservatives</span>
              <span>Made fresh weekly</span>
              <span>Locally sourced</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative h-72 overflow-hidden rounded-[2.5rem] shadow-premium md:h-[28rem]"
          >
            <Image
              src="/hero-dogs-park.jpeg"
              alt="Three happy, healthy dogs playing together at the park"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="bg-barkley-cream py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Featured</p>
            <h2 className="mt-2 font-display text-3xl text-barkley-cocoa md:text-4xl">
              What&apos;s on the menu
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="group overflow-hidden rounded-3xl bg-white/90 shadow-soft ring-1 ring-white/70 transition hover:-translate-y-1 hover:shadow-premium"
              >
                <Link href={`/shop/${product.slug}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="space-y-2 p-5">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-barkley-sage">
                    {PRODUCT_TAGLINES[product.slug] ?? "Small batch, made fresh"}
                  </p>
                  <Link href={`/shop/${product.slug}`}>
                    <h3 className="font-display text-lg text-barkley-cocoa">{product.name}</h3>
                  </Link>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-semibold text-barkley-cocoa">
                      {formatMoney(product.price)}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full text-[0.65rem] uppercase tracking-[0.14em]"
                      onClick={() =>
                        handleQuickAdd(product.id, product.defaultVariantId, product.name)
                      }
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= OUR PROCESS ================= */}
      <section className="bg-barkley-sand/40 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">
              From scrap to supper
            </p>
            <h2 className="mt-2 font-display text-3xl text-barkley-cocoa md:text-4xl">
              How a Barkley Bites meal comes together
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-white/70"
            >
              <div className="relative h-56">
                <Image
                  src="/process-raw-salmon.jpeg"
                  alt="Fresh salmon seasoned with dill, ready to bake"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="space-y-2 p-6">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-barkley-sage">Step 1</p>
                <h3 className="font-display text-lg text-barkley-cocoa">Daily rescued salmon</h3>
                <p className="text-sm text-muted-foreground">
                  &ldquo;Barkley Bites began with capturing some of our waste that we would create when
                  we were cutting up slices of salmon for sale... that scrap would typically go into
                  the trash. We were able to capture that on a daily basis.&rdquo;
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-white/70"
            >
              <div className="relative h-56">
                <Image
                  src="/process-finished-meal.jpeg"
                  alt="Finished Barkley Bites meal: salmon, lentils, and shredded sweet potato"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="space-y-2 p-6">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-barkley-sage">Step 2</p>
                <h3 className="font-display text-lg text-barkley-cocoa">Hand-mixed, small batch</h3>
                <p className="text-sm text-muted-foreground">
                  Salmon is baked and hand-separated to be completely free of bones. Broccoli and
                  lentils are steamed, and sweet potato is sliced paper-thin — every component is
                  chosen so your dog&apos;s digestive system can use all of it.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-white/70"
            >
              <div className="relative h-56">
                <Image
                  src="/product-jerky.jpeg"
                  alt="Finished Barkley Bites salmon jerky"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="space-y-2 p-6">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-barkley-sage">Step 3</p>
                <h3 className="font-display text-lg text-barkley-cocoa">Made fresh, every week</h3>
                <p className="text-sm text-muted-foreground">
                  No preservatives means a 4-day freshness window — proof there&apos;s nothing
                  artificial keeping it on a shelf. Just real food, the way you&apos;d make it yourself.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= MEET SCHUYLER ================= */}
      <section className="bg-barkley-cream py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative h-80 overflow-hidden rounded-[2.5rem] shadow-premium md:h-[26rem]"
            >
              <Image
                src="/schuyler-dogs.jpeg"
                alt="Schuyler Ford, founder of Barkley Bites, with his two dogs"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">
                Meet the founder
              </p>
              <h2 className="font-display text-3xl text-barkley-cocoa md:text-4xl">Hi, I&apos;m Schuyler.</h2>
              <p className="text-base italic text-muted-foreground">
                &ldquo;Two reasons I started Barkley Bites. One, I love my dogs. Two, I love to make
                sure they&apos;ve got everything they need as far as health, energy, and nutrition.&rdquo;
              </p>
              <p className="text-sm text-muted-foreground">
                Every recipe starts the same way it did on day one — in a real kitchen, by hand,
                in small batches, using salmon that would otherwise go to waste. Watch Schuyler
                walk through how a Barkley Bites meal actually comes together, in his own words.
              </p>

              <div className="overflow-hidden rounded-3xl shadow-soft ring-1 ring-white/70">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  controls
                  preload="metadata"
                  poster="/schuyler-dogs.jpeg"
                  className="w-full"
                >
                  <source src="/founder-story.mp4" type="video/mp4" />
                </video>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= LIFESTYLE STRIP ================= */}
      <section className="bg-barkley-mist/40 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">The pack</p>
            <h2 className="mt-2 font-display text-3xl text-barkley-cocoa md:text-4xl">
              Real dogs. Real energy.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { src: "/lifestyle-catch.jpeg", alt: "A goldendoodle leaping to catch a ball mid-air" },
              { src: "/lifestyle-creek.jpeg", alt: "Two dogs sharing a ball in a creek" },
              { src: "/lifestyle-park.jpeg", alt: "Dogs playing together at the dog park" },
            ].map((img, i) => (
              <motion.div
                key={img.src}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative h-64 overflow-hidden rounded-3xl shadow-soft"
              >
                <Image src={img.src} alt={img.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ASK BISCUIT NUDGE ================= */}
      <section className="bg-barkley-forest py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center md:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-mist">New here?</p>
          <h2 className="font-display text-2xl text-barkley-cream md:text-3xl">
            Ask Biscuit anything 🐟
          </h2>
          <p className="max-w-md text-sm text-barkley-cream/80">
            Curious what&apos;s actually in the food, or what&apos;s right for your dog? Our resident
            AI (and biggest fan of fresh salmon) is in the corner, ready to chat.
          </p>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="bg-barkley-cream py-16 text-center md:py-20">
        <div className="mx-auto max-w-xl space-y-4 px-4">
          <h2 className="font-display text-3xl text-barkley-cocoa">Elevate their meals.</h2>
          <p className="text-sm text-muted-foreground">
            Transform mealtime into a cherished ritual, where every bite brings joy and well-being.
          </p>
          <Link href="/shop">
            <Button className="rounded-full px-10 text-xs font-semibold uppercase tracking-[0.2em]">
              Shop now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
