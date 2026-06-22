import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose";

const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    slug: { type: String },
    name: { type: String, required: true },
    image: { type: String, required: true },
    variantId: { type: String, required: true },
    variantLabel: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    subscription: { type: Boolean, default: false },
  },
  { _id: false },
);

const orderAddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: true },
    orderNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    shippingAddress: { type: orderAddressSchema, required: true },
    deliveryMethodId: { type: String, required: true },
    promoCode: { type: String },
    deliveryEstimate: { type: String },
    stripeCheckoutSessionId: { type: String },
    stripePaymentIntentId: { type: String },
  },
  { timestamps: true },
);

export type OrderDocument = InferSchemaType<typeof orderSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const OrderModel = models.Order ?? model("Order", orderSchema);
