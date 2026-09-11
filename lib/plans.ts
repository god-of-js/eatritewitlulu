export type PlanCategoryId = "standard" | "high-protein";

export type MealPlan = {
  id: string;
  name: string;
  shortName: string;
  category: PlanCategoryId;
  monthlyPrice: number;
  weeklyPrice: number;
  currency: "NGN";
  mealsPerMonth: number;
  mealsPerWeek: number;
  includes: string;
  daysPerWeek: number;
  daysTotal: number;
  ctaLabel: string;
  active: boolean;
};

export type PlanCategory = {
  id: PlanCategoryId;
  name: string;
  eyebrow: string;
  description: string;
  highlights: string[];
};

export const planCategories: PlanCategory[] = [
  {
    id: "standard",
    name: "Standard Meal Plans",
    eyebrow: "Standard",
    description:
      "Designed for people who want to eat healthy and feel their best. Properly portioned meals that make healthy eating simple, convenient and sustainable.",
    highlights: [
      "Nutritious & balanced meals",
      "Convenient & time-saving",
      "Consistent results, every day",
    ],
  },
  {
    id: "high-protein",
    name: "High-Protein Meal Plans",
    eyebrow: "High-Protein",
    description:
      "High-protein, properly portioned meals designed for bodybuilders and fitness enthusiasts — whether you're building muscle, shredding fat or improving performance.",
    highlights: [
      "High protein balanced meals",
      "Supports muscle growth & recovery",
      "Aids fat loss & body composition",
    ],
  },
];

/**
 * Central place to update plan names and prices.
 * WhatsApp messages use each plan's `name`.
 */
export const mealPlans: MealPlan[] = [
  {
    id: "standard-all-inclusive",
    name: "Standard All Inclusive Plan",
    shortName: "All Inclusive",
    category: "standard",
    monthlyPrice: 1_090_000,
    weeklyPrice: 275_000,
    currency: "NGN",
    mealsPerMonth: 84,
    mealsPerWeek: 21,
    includes: "Breakfast, lunch & dinner",
    daysPerWeek: 7,
    daysTotal: 28,
    ctaLabel: "Choose this plan",
    active: true,
  },
  {
    id: "standard-weekday",
    name: "Standard Weekday Plan",
    shortName: "Weekday",
    category: "standard",
    monthlyPrice: 779_000,
    weeklyPrice: 195_000,
    currency: "NGN",
    mealsPerMonth: 60,
    mealsPerWeek: 15,
    includes: "Breakfast, lunch & dinner",
    daysPerWeek: 5,
    daysTotal: 20,
    ctaLabel: "Choose this plan",
    active: true,
  },
  {
    id: "standard-lunch-extra-1",
    name: "Standard Lunch Extra 1 Plan",
    shortName: "Lunch Extra 1",
    category: "standard",
    monthlyPrice: 723_000,
    weeklyPrice: 181_000,
    currency: "NGN",
    mealsPerMonth: 56,
    mealsPerWeek: 14,
    includes: "Lunch & dinner",
    daysPerWeek: 7,
    daysTotal: 28,
    ctaLabel: "Choose this plan",
    active: true,
  },
  {
    id: "standard-lunch-extra-2",
    name: "Standard Lunch Extra 2 Plan",
    shortName: "Lunch Extra 2",
    category: "standard",
    monthlyPrice: 516_000,
    weeklyPrice: 130_000,
    currency: "NGN",
    mealsPerMonth: 40,
    mealsPerWeek: 10,
    includes: "Lunch & dinner",
    daysPerWeek: 5,
    daysTotal: 20,
    ctaLabel: "Choose this plan",
    active: true,
  },
  {
    id: "standard-omad-1",
    name: "Standard OMAD 1 Plan",
    shortName: "OMAD 1",
    category: "standard",
    monthlyPrice: 361_000,
    weeklyPrice: 91_000,
    currency: "NGN",
    mealsPerMonth: 28,
    mealsPerWeek: 7,
    includes: "Lunch only",
    daysPerWeek: 7,
    daysTotal: 28,
    ctaLabel: "Choose this plan",
    active: true,
  },
  {
    id: "standard-omad-2",
    name: "Standard OMAD 2 Plan",
    shortName: "OMAD 2",
    category: "standard",
    monthlyPrice: 258_000,
    weeklyPrice: 65_000,
    currency: "NGN",
    mealsPerMonth: 20,
    mealsPerWeek: 5,
    includes: "Lunch only",
    daysPerWeek: 5,
    daysTotal: 20,
    ctaLabel: "Choose this plan",
    active: true,
  },
  {
    id: "high-protein-all-inclusive",
    name: "High-Protein All Inclusive Plan",
    shortName: "All Inclusive",
    category: "high-protein",
    monthlyPrice: 1_345_000,
    weeklyPrice: 336_000,
    currency: "NGN",
    mealsPerMonth: 84,
    mealsPerWeek: 21,
    includes: "Breakfast, lunch & dinner",
    daysPerWeek: 7,
    daysTotal: 28,
    ctaLabel: "Choose this plan",
    active: true,
  },
  {
    id: "high-protein-weekday",
    name: "High-Protein Weekday Plan",
    shortName: "Weekday",
    category: "high-protein",
    monthlyPrice: 960_000,
    weeklyPrice: 240_000,
    currency: "NGN",
    mealsPerMonth: 60,
    mealsPerWeek: 15,
    includes: "Breakfast, lunch & dinner",
    daysPerWeek: 5,
    daysTotal: 20,
    ctaLabel: "Choose this plan",
    active: true,
  },
  {
    id: "high-protein-lunch-extra-1",
    name: "High-Protein Lunch Extra 1 Plan",
    shortName: "Lunch Extra 1",
    category: "high-protein",
    monthlyPrice: 900_000,
    weeklyPrice: 225_000,
    currency: "NGN",
    mealsPerMonth: 56,
    mealsPerWeek: 14,
    includes: "Lunch & dinner",
    daysPerWeek: 7,
    daysTotal: 28,
    ctaLabel: "Choose this plan",
    active: true,
  },
  {
    id: "high-protein-lunch-extra-2",
    name: "High-Protein Lunch Extra 2 Plan",
    shortName: "Lunch Extra 2",
    category: "high-protein",
    monthlyPrice: 640_000,
    weeklyPrice: 160_000,
    currency: "NGN",
    mealsPerMonth: 40,
    mealsPerWeek: 10,
    includes: "Lunch & dinner",
    daysPerWeek: 5,
    daysTotal: 20,
    ctaLabel: "Choose this plan",
    active: true,
  },
  {
    id: "high-protein-omad-1",
    name: "High-Protein OMAD 1 Plan",
    shortName: "OMAD 1",
    category: "high-protein",
    monthlyPrice: 450_000,
    weeklyPrice: 113_000,
    currency: "NGN",
    mealsPerMonth: 28,
    mealsPerWeek: 7,
    includes: "Lunch only",
    daysPerWeek: 7,
    daysTotal: 28,
    ctaLabel: "Choose this plan",
    active: true,
  },
  {
    id: "high-protein-omad-2",
    name: "High-Protein OMAD 2 Plan",
    shortName: "OMAD 2",
    category: "high-protein",
    monthlyPrice: 330_000,
    weeklyPrice: 82_000,
    currency: "NGN",
    mealsPerMonth: 20,
    mealsPerWeek: 5,
    includes: "Lunch only",
    daysPerWeek: 5,
    daysTotal: 20,
    ctaLabel: "Choose this plan",
    active: true,
  },
];

export const activePlans = mealPlans.filter((plan) => plan.active);

export function getPlanById(id: string) {
  return mealPlans.find((plan) => plan.id === id);
}

export function getPlansByCategory(category: PlanCategoryId) {
  return activePlans.filter((plan) => plan.category === category);
}

export function formatPlanPrice(price: number, currency: "NGN" = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
