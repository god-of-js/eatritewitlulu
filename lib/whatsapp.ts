import { siteConfig } from "@/lib/config";
import type { MealPlan } from "@/lib/plans";

function normalizeWhatsAppNumber(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) {
    digits = `234${digits.slice(1)}`;
  }
  return digits;
}

export function getWhatsAppUrl(message: string) {
  const number = normalizeWhatsAppNumber(siteConfig.whatsappNumber);
  const path = number.length >= 10 ? number : "";
  return `https://wa.me/${path}?text=${encodeURIComponent(message)}`;
}

const categoryLabel = {
  standard: "Standard",
  "high-protein": "High-Protein",
} as const;

export function getWhatsAppPlanName(
  plan: Pick<MealPlan, "shortName" | "category">,
) {
  return `${plan.shortName} ${categoryLabel[plan.category]} Plan`;
}

export function getPlanWhatsAppMessage(
  plan: Pick<MealPlan, "shortName" | "category">,
) {
  return `Hello EatriteWithLulu 👋
I'm interested in the ${getWhatsAppPlanName(plan)}.
I'd like to get started.`;
}

export function getGeneralWhatsAppMessage() {
  return `Hello EatriteWithLulu 👋
I'd love to learn more about your meal plans and get started.`;
}

export function getPlanWhatsAppUrl(
  plan: Pick<MealPlan, "shortName" | "category">,
) {
  return getWhatsAppUrl(getPlanWhatsAppMessage(plan));
}

export function getGeneralWhatsAppUrl() {
  return getWhatsAppUrl(getGeneralWhatsAppMessage());
}
