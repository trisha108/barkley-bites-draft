import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose";

const subscriptionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: String, required: true },
    stripeSubscriptionId: { type: String, required: true, unique: true },
    stripePriceId: { type: String },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled", "past_due", "trialing"],
      default: "active",
    },
    interval: { type: String, enum: ["month", "year"], default: "month" },
    nextDeliveryAt: { type: Date },
    skipCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type SubscriptionDocument = InferSchemaType<typeof subscriptionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SubscriptionModel = models.Subscription ?? model("Subscription", subscriptionSchema);
