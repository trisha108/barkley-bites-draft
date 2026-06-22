import { z } from "zod";

export const BREEDS = [
  "Australian Shepherd",
  "Beagle",
  "Boxer",
  "Bulldog",
  "Cavalier King Charles",
  "Dachshund",
  "French Bulldog",
  "German Shepherd",
  "German Shorthaired Pointer",
  "Golden Retriever",
  "Labrador",
  "Mixed Breed",
  "Pembroke Welsh Corgi",
  "Poodle",
  "Rottweiler",
  "Shih Tzu",
  "Yorkshire Terrier",
] as const;

export type Breed = (typeof BREEDS)[number];

export const SIGNUP_SOURCES = [
  "",
  "Website",
  "Instagram",
  "Referral",
  "In-person",
  "Other",
] as const;
export const PET_SEXES = ["", "Male", "Female", "Unknown"] as const;

export const profileSchema = z
  .object({
    // Section 1 — About You
    owner_first_name: z.string().min(1, "First name is required"),
    owner_last_name: z.string().min(1, "Last name is required"),
    owner_email: z.string().email("Enter a valid email"),
    owner_phone: z.string().optional(),
    owner_city: z.string().optional(),

    // Section 2 — About Your Pet
    pet_name: z.string().min(1, "Pet name is required"),
    pet_breed: z
      .string()
      .refine(
        (v) => (BREEDS as readonly string[]).includes(v),
        "Please select a breed",
      ),
    pet_birthday: z.string().optional(),
    pet_age_years: z.coerce
      .number()
      .min(0, "Min 0")
      .max(25, "Max 25")
      .optional()
      .or(z.literal("")),
    pet_weight_lbs: z.coerce
      .number({ invalid_type_error: "Weight is required" })
      .min(1, "Min 1 lb")
      .max(200, "Max 200 lbs"),
    pet_sex: z.enum(PET_SEXES).optional(),
    health_conditions: z.string().optional(),
    signup_source: z.enum(SIGNUP_SOURCES).optional(),
  })
  .superRefine((data, ctx) => {
    const hasBirthday = Boolean(data.pet_birthday);
    const hasAge =
      data.pet_age_years !== "" &&
      data.pet_age_years !== undefined &&
      data.pet_age_years !== null;
    if (!hasBirthday && !hasAge) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a birthday or an age in years",
        path: ["pet_age_years"],
      });
    }
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;

export function calcAgeFromBirthday(dateStr: string): number {
  const birth = new Date(dateStr);
  if (isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

export const emptyProfileDefaults: ProfileFormValues = {
  owner_first_name: "",
  owner_last_name: "",
  owner_email: "",
  owner_phone: "",
  owner_city: "",
  pet_name: "",
  pet_breed: "",
  pet_birthday: "",
  pet_age_years: "",
  // @ts-expect-error — empty string is the unset sentinel for this required number field
  pet_weight_lbs: "",
  pet_sex: "",
  health_conditions: "",
  signup_source: "",
};

export const GOOGLE_SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbxGtmpqn7PN3mgmhUa05kZUIa0__eoqg5H-SUpMu0C1aLDE5-bxoh9BS-JNXlprC2pOSw/exec";
