"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { products } from "@/data/products";
import { useBarkleyStore } from "@/store/use-store";
import { toast } from "sonner";

export function ShopView() {
  const addToCart = useBarkleyStore((s) => s.addToCart);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Barkley Bites
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/collections/all" className="text-gray-600 hover:text-gray-900">
                Shop
              </Link>
              <Link href="/pages/contact" className="text-gray-600 hover:text-gray-900">
                Contact
              </Link>
              <div className="text-gray-600">
                Total items in cart: 0
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Shop Header */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Shop
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Driven by a passion for pet wellness, we embrace a philosophy of nourishment that prioritizes quality and authenticity. Our mission is to provide boutique pet food with carefully sourced ingredients, ensuring every meal contributes to a healthier, happier life for your beloved companions.
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square relative">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    {product.compareAtPrice && (
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 font-semibold">
                          Sale price ${product.price}
                        </span>
                        <span className="text-gray-500 line-through">
                          Regular price ${product.compareAtPrice}
                        </span>
                      </div>
                    )}
                    {!product.compareAtPrice && (
                      <span className="text-gray-900 font-semibold">
                        ${product.price}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      addToCart({
                        productId: product.id,
                        variantId: product.defaultVariantId,
                        quantity: 1,
                      });
                      toast.success(`${product.name} added to cart!`);
                    }}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">
              Join our pet-loving community
            </h3>
            <div className="flex justify-center mb-8">
              <input
                type="email"
                placeholder="Email"
                className="px-4 py-2 rounded-l-md text-gray-900"
              />
              <button className="bg-blue-600 text-white px-6 py-2 rounded-r-md hover:bg-blue-700 transition-colors">
                Sign up
              </button>
            </div>
            <div className="flex justify-center gap-6 mb-6">
              <a href="https://facebook.com/barkleybitesbowls" className="text-gray-400 hover:text-white">
                Facebook
              </a>
              <a href="https://www.instagram.com/barkleybitesbowls" className="text-gray-400 hover:text-white">
                Instagram
              </a>
              <a href="https://www.youtube.com/barkleybowls" className="text-gray-400 hover:text-white">
                Youtube
              </a>
              <a href="https://www.tiktok.com/@shopify" className="text-gray-400 hover:text-white">
                Tiktok
              </a>
              <a href="https://www.twitter.com/shopify" className="text-gray-400 hover:text-white">
                Twitter
              </a>
              <a href="https://www.threads.net/@shopify" className="text-gray-400 hover:text-white">
                Threads
              </a>
            </div>
            <div className="text-gray-400 text-sm">
              <p>© 2026 Barkley Bites, Powered by Shopify</p>
              <div className="mt-2">
                <a href="#" className="text-gray-400 hover:text-white mr-4">Terms and Policies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
