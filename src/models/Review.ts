import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose";

const reviewSchema = new Schema(
  {
    legacyId: { type: String, unique: true, sparse: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String, required: true },
    avatarUrl: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    body: { type: String, required: true },
    verified: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true },
);

reviewSchema.index({ product: 1, createdAt: -1 });

export type ReviewDocument = InferSchemaType<typeof reviewSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ReviewModel = models.Review ?? model("Review", reviewSchema);
