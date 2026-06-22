import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose";

const cartLineSchema = new Schema(
  {
    productId: { type: String, required: true },
    variantId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    savedForLater: { type: Boolean, default: false },
  },
  { _id: false },
);

const cartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    guestToken: { type: String, index: true },
    lines: { type: [cartLineSchema], default: [] },
    promoCode: { type: String },
  },
  { timestamps: true },
);

cartSchema.index({ user: 1 }, { unique: true, sparse: true });
cartSchema.index({ guestToken: 1 }, { unique: true, sparse: true });

export type CartDocument = InferSchemaType<typeof cartSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CartModel = models.Cart ?? model("Cart", cartSchema);
