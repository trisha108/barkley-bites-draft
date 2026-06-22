import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose";

const variantSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    priceModifier: { type: Number, default: 0 },
  },
  { _id: false },
);

const nutritionFactSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    legacyId: { type: String, index: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: { type: String, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    images: [{ type: String, required: true }],
    category: {
      type: String,
      enum: ["treats", "wellness", "supplements", "bundles"],
      required: true,
    },
    flavors: [{ type: String }],
    dogSizes: [{ type: String }],
    dietary: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    badges: [{ type: String }],
    inStock: { type: Boolean, default: true },
    subscriptionEligible: { type: Boolean, default: true },
    variants: { type: [variantSchema], default: [] },
    defaultVariantId: { type: String, required: true },
    nutritionFacts: { type: [nutritionFactSchema], default: [] },
    ingredients: [{ type: String }],
    feedingGuide: { type: String, required: true },
    shippingNote: { type: String, required: true },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", tagline: "text", description: "text" });

export type ProductDocument = InferSchemaType<typeof productSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ProductModel = models.Product ?? model("Product", productSchema);
