import type { MealPlan } from "@/lib/plans";

export const deliveryFrequencies = [
  {
    id: "daily",
    label: "Daily",
    description: "Delivered on every plan day you paid for.",
  },
  {
    id: "3x-week",
    label: "3x per week",
    description: "Three deliveries each week of your plan.",
  },
  {
    id: "1x-week",
    label: "1x per week",
    description: "One delivery each week of your plan.",
  },
] as const;

export type DeliveryFrequency = (typeof deliveryFrequencies)[number]["id"];

export const deliveryLocations = [
  {
    id: "island",
    label: "Island",
    price: 3000,
  },
  {
    id: "mainland",
    label: "Mainland",
    price: 5000,
  },
] as const;

export type DeliveryLocation = (typeof deliveryLocations)[number]["id"];

export const billingPeriods = [
  {
    id: "week",
    label: "1 week",
    description: "Pay the weekly price for this week's meals only.",
  },
  {
    id: "month",
    label: "1 month",
    description: "Pay the monthly price for the full plan.",
  },
] as const;

export type BillingPeriod = (typeof billingPeriods)[number]["id"];

export function isBillingPeriod(value: string): value is BillingPeriod {
  return billingPeriods.some((item) => item.id === value);
}

export function getBillingPeriodLabel(period: BillingPeriod) {
  return billingPeriods.find((item) => item.id === period)?.label ?? period;
}

export function isDeliveryFrequency(
  value: string,
): value is DeliveryFrequency {
  return deliveryFrequencies.some((item) => item.id === value);
}

export function isDeliveryLocation(value: string): value is DeliveryLocation {
  return deliveryLocations.some((item) => item.id === value);
}

export function normalizeDeliveryAddress(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function isDeliveryAddress(value: string) {
  return value.length >= 8 && value.length <= 300;
}

export function getWeekCount(plan: MealPlan) {
  return Math.max(1, Math.round(plan.daysTotal / plan.daysPerWeek));
}

export function getCoveredDays(plan: MealPlan, period: BillingPeriod) {
  return period === "week" ? plan.daysPerWeek : plan.daysTotal;
}

export function getCoveredMeals(plan: MealPlan, period: BillingPeriod) {
  return period === "week" ? plan.mealsPerWeek : plan.mealsPerMonth;
}

export function getDeliveryCount(
  plan: MealPlan,
  frequency: DeliveryFrequency,
  period: BillingPeriod = "month",
) {
  const weeks = period === "week" ? 1 : getWeekCount(plan);
  if (frequency === "daily") {
    return period === "week" ? plan.daysPerWeek : plan.daysTotal;
  }
  if (frequency === "3x-week") return 3 * weeks;
  return weeks;
}

export function getDeliveryRate(location: DeliveryLocation) {
  return deliveryLocations.find((item) => item.id === location)!.price;
}

export function calculateOrder(
  plan: MealPlan,
  frequency: DeliveryFrequency,
  location: DeliveryLocation,
  period: BillingPeriod = "month",
) {
  const deliveryCount = getDeliveryCount(plan, frequency, period);
  const deliveryRate = getDeliveryRate(location);
  const deliveryFee = deliveryCount * deliveryRate;
  const planPrice = period === "week" ? plan.weeklyPrice : plan.monthlyPrice;
  const daysCovered = getCoveredDays(plan, period);
  const mealsCovered = getCoveredMeals(plan, period);

  return {
    planId: plan.id,
    planName: plan.name,
    planType: plan.category,
    billingPeriod: period,
    planPrice,
    deliveryFrequency: frequency,
    deliveryCount,
    deliveryLocation: location,
    deliveryRate,
    deliveryFee,
    total: planPrice + deliveryFee,
    daysCovered,
    mealsCovered,
    daysTotal: daysCovered,
  };
}

export function getFrequencyLabel(frequency: DeliveryFrequency) {
  return deliveryFrequencies.find((item) => item.id === frequency)?.label ?? frequency;
}

export function getLocationLabel(location: DeliveryLocation) {
  return deliveryLocations.find((item) => item.id === location)?.label ?? location;
}
