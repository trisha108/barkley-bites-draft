import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose";

const addressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, required: true },
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

addressSchema.index({ user: 1 });

export type AddressDocument = InferSchemaType<typeof addressSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AddressModel = models.Address ?? model("Address", addressSchema);
