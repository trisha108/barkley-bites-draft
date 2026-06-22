// Shared question list — used by both the modal component and the API route
// that tracks rotation state and saves answers.

export type QuestionField =
  | "pet_breed"
  | "pet_birthday"
  | "pet_age_years"
  | "pet_weight_lbs"
  | "pet_sex"
  | "health_conditions"
  | "allergies"
  | "activity_level"
  | "picky_eater"
  | "travel_plans"
  | "vet_recommendations"
  | "favorite_things"
  | "past_food_issues"
  | "life_stage";

export type QuestionDef = {
  field: QuestionField;
  question: string;
  inputType: "text" | "select" | "date" | "number" | "textarea";
  options?: string[];
  // How often (in days) this question should be re-asked once already answered.
  // null = only ever ask once.
  reaskAfterDays: number | null;
};

export const ROTATING_QUESTIONS: QuestionDef[] = [
  {
    field: "pet_breed",
    question: "What breed is your dog?",
    inputType: "text",
    reaskAfterDays: null,
  },
  {
    field: "pet_birthday",
    question: "When is your dog's birthday?",
    inputType: "date",
    reaskAfterDays: null,
  },
  {
    field: "pet_age_years",
    question: "How old is your dog?",
    inputType: "number",
    reaskAfterDays: null,
  },
  {
    field: "pet_weight_lbs",
    question: "How much does your dog weigh (in lbs)?",
    inputType: "number",
    reaskAfterDays: 180,
  },
  {
    field: "pet_sex",
    question: "What's your dog's sex?",
    inputType: "select",
    options: ["Male", "Female", "Unknown"],
    reaskAfterDays: null,
  },
  {
    field: "health_conditions",
    question: "Does your dog have any health conditions we should know about?",
    inputType: "textarea",
    reaskAfterDays: 120,
  },
  {
    field: "allergies",
    question: "Does your dog have any allergies?",
    inputType: "textarea",
    reaskAfterDays: 120,
  },
  {
    field: "activity_level",
    question: "How would you describe your dog's activity level?",
    inputType: "select",
    options: ["Low", "Moderate", "High"],
    reaskAfterDays: 90,
  },
  {
    field: "picky_eater",
    question: "Is your dog a picky eater, or will they eat anything?",
    inputType: "select",
    options: ["Picky eater", "Eats anything", "Somewhere in between"],
    reaskAfterDays: 90,
  },
  {
    field: "travel_plans",
    question: "Any upcoming travel where deliveries might need to pause?",
    inputType: "text",
    reaskAfterDays: 30,
  },
  {
    field: "vet_recommendations",
    question: "Has your vet given you any dietary recommendations recently?",
    inputType: "textarea",
    reaskAfterDays: 90,
  },
  {
    field: "favorite_things",
    question: "What does your dog love most — treats, walks, belly rubs, car rides?",
    inputType: "text",
    reaskAfterDays: null,
  },
  {
    field: "past_food_issues",
    question: "Any past food sensitivities or brands that didn't work well?",
    inputType: "textarea",
    reaskAfterDays: null,
  },
  {
    field: "life_stage",
    question: "Is your dog still a puppy, fully grown, or a senior?",
    inputType: "select",
    options: ["Puppy", "Adult", "Senior"],
    reaskAfterDays: 180,
  },
];
