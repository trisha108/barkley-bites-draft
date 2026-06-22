import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose";

const addressSchema = new Schema(
  {
    label: { type: String },
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

// Embedded profile document — field names match the onboarding form payload exactly,
// plus the rotating-question fields appended for the gradual data collection system.
const profileSchema = new Schema(
  {
    owner_first_name: { type: String },
    owner_last_name: { type: String },
    owner_email: { type: String },
    owner_phone: { type: String },
    owner_city: { type: String },
    pet_name: { type: String },
    pet_breed: { type: String },
    pet_birthday: { type: String },
    pet_age_years: { type: Number },
    pet_weight_lbs: { type: Number },
    pet_sex: { type: String, enum: ["Male", "Female", "Unknown", ""] },
    health_conditions: { type: String },
    signup_source: {
      type: String,
      enum: ["Website", "Instagram", "Referral", "In-person", "Other", ""],
    },
    // Rotating-question fields (item 3) — collected gradually, one per login
    allergies: { type: String },
    activity_level: { type: String },
    picky_eater: { type: String },
    travel_plans: { type: String },
    vet_recommendations: { type: String },
    favorite_things: { type: String },
    past_food_issues: { type: String },
    life_stage: { type: String },
  },
  { _id: false },
);

// Tracks, per question field, when it was last answered — used to decide
// what to ask next and when to re-ask a field whose answer may have changed.
const questionLogEntrySchema = new Schema(
  {
    field: { type: String, required: true },
    answeredAt: { type: Date, required: true },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    name: { type: String, required: true },
    image: { type: String },
    emailVerified: { type: Date },
    isAdmin: { type: Boolean, default: false },
    marketingOptIn: { type: Boolean, default: false },
    stripeCustomerId: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    defaultAddress: addressSchema,
    profile: profileSchema,
    questionLog: { type: [questionLogEntrySchema], default: [] },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel = models.User ?? model("User", userSchema);
