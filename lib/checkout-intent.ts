import { cookies } from "next/headers";
import type { MenuCheckoutItem } from "@/lib/menu-checkout";
import type {
  BillingPeriod,
  DeliveryFrequency,
  DeliveryLocation,
} from "@/lib/pricing";

const COOKIE = "eatrite_checkout";

export type PlanCheckoutIntent = {
  kind?: "plan";
  userId: string;
  planId: string;
  period: BillingPeriod;
  frequency: DeliveryFrequency;
  location: DeliveryLocation;
  address: string;
  amount: number;
  reference: string;
};

export type MenuCheckoutIntent = {
  kind: "menu";
  userId: string;
  name: string;
  phone: string;
  address: string;
  location: DeliveryLocation;
  items: MenuCheckoutItem[];
  amount: number;
  reference: string;
};

export type CheckoutIntent = PlanCheckoutIntent | MenuCheckoutIntent;

export function isMenuCheckoutIntent(
  intent: CheckoutIntent | null,
): intent is MenuCheckoutIntent {
  return intent?.kind === "menu";
}

export async function setCheckoutIntent(intent: CheckoutIntent) {
  const store = await cookies();
  store.set(COOKIE, JSON.stringify(intent), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60,
    path: "/",
  });
}

export async function getCheckoutIntent() {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CheckoutIntent;
  } catch {
    return null;
  }
}

export async function clearCheckoutIntent() {
  const store = await cookies();
  store.delete(COOKIE);
}
