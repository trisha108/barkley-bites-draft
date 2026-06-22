import { config } from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/mongodb";
import { products, reviews, subscriptionPlans } from "../src/data/products";
import { CategoryModel, CouponModel, ProductModel, ReviewModel } from "../src/models";

config({ path: ".env.local" });
config();

async function seedCategories() {
  const defs = [
    {
      slug: "treats",
      name: "Treats",
      description: "Chef-crafted rewards for training, spoiling, and celebrating.",
      featured: true,
      sortOrder: 1,
    },
    {
      slug: "wellness",
      name: "Wellness",
      description: "Calming, skin, paw, and daily ritual support.",
      featured: true,
      sortOrder: 2,
    },
    {
      slug: "supplements",
      name: "Supplements",
      description: "Targeted nutrition for joints, gut, heart, and coat.",
      featured: true,
      sortOrder: 3,
    },
    {
      slug: "bundles",
      name: "Bundles",
      description: "Curated rituals with built-in savings.",
      featured: false,
      sortOrder: 4,
    },
  ];

  for (const c of defs) {
    await CategoryModel.updateOne(
      { slug: c.slug },
      {
        $set: {
          name: c.name,
          description: c.description,
          featured: c.featured,
          sortOrder: c.sortOrder,
        },
      },
      { upsert: true },
    );
  }
}

async function seedProducts() {
  for (const p of products) {
    await ProductModel.updateOne(
      { slug: p.slug },
      {
        $set: {
          legacyId: p.id,
          slug: p.slug,
          name: p.name,
          tagline: p.tagline,
          description: p.description,
          longDescription: p.longDescription,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          images: p.images,
          category: p.category,
          flavors: p.flavors,
          dogSizes: p.dogSizes,
          dietary: p.dietary,
          rating: p.rating,
          reviewCount: p.reviewCount,
          badges: p.badges,
          inStock: p.inStock,
          subscriptionEligible: p.subscriptionEligible,
          variants: p.variants,
          defaultVariantId: p.defaultVariantId,
          nutritionFacts: p.nutritionFacts,
          ingredients: p.ingredients,
          feedingGuide: p.feedingGuide,
          shippingNote: p.shippingNote,
        },
      },
      { upsert: true },
    );
  }
}

async function seedReviews() {
  const legacyProductMap = new Map<string, string>();
  const dbProducts = await ProductModel.find({ legacyId: { $exists: true } }).select("_id legacyId");
  for (const doc of dbProducts) {
    if (doc.legacyId) {
      legacyProductMap.set(doc.legacyId, doc._id.toString());
    }
  }

  for (const r of reviews) {
    const productMongoId = legacyProductMap.get(r.productId);
    if (!productMongoId) continue;

    await ReviewModel.updateOne(
      { legacyId: r.id },
      {
        $set: {
          legacyId: r.id,
          product: new mongoose.Types.ObjectId(productMongoId),
          authorName: r.author,
          avatarUrl: r.avatarUrl,
          rating: r.rating,
          title: r.title,
          body: r.body,
          verified: r.verified,
          helpful: r.helpful,
        },
      },
      { upsert: true },
    );
  }
}

async function seedCoupons() {
  await CouponModel.updateOne(
    { code: "WELCOME10" },
    {
      $set: {
        code: "WELCOME10",
        type: "percent",
        amount: 10,
        minSpend: 40,
        active: true,
      },
    },
    { upsert: true },
  );

  await CouponModel.updateOne(
    { code: "BARKLEY20" },
    {
      $set: {
        code: "BARKLEY20",
        type: "fixed",
        amount: 20,
        minSpend: 75,
        active: true,
      },
    },
    { upsert: true },
  );
}

async function main() {
  await connectDB();
  await seedCategories();
  await seedProducts();
  await seedReviews();
  await seedCoupons();

  // subscriptionPlans is currently merchandising copy; Stripe price IDs wire in at runtime.
  void subscriptionPlans;

  // eslint-disable-next-line no-console
  console.log("Barkley Bites seed completed.");
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
