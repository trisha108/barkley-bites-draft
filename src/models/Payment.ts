import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose";

const paymentSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    stripePaymentIntentId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "canceled"],
      default: "pending",
    },
    lastError: { type: String },
    raw: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export type PaymentDocument = InferSchemaType<typeof paymentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PaymentModel = models.Payment ?? model("Payment", paymentSchema);
