import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    amount: { type: Number, required: true },
    minSpend: { type: Number },
    expiresAt: { type: Date },
    active: { type: Boolean, default: true },
    maxRedemptions: { type: Number },
    redemptionsCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type CouponDocument = InferSchemaType<typeof couponSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CouponModel = models.Coupon ?? model("Coupon", couponSchema);
