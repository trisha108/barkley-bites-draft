import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose";

const wishlistSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    productIds: [{ type: String }],
  },
  { timestamps: true },
);

export type WishlistDocument = InferSchemaType<typeof wishlistSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const WishlistModel = models.Wishlist ?? model("Wishlist", wishlistSchema);
