import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: "Category" },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type CategoryDocument = InferSchemaType<typeof categorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CategoryModel = models.Category ?? model("Category", categorySchema);
