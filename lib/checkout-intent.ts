import { cookies } from "next/headers";
import type {
  BillingPeriod,
  DeliveryFrequency,
  DeliveryLocation,
} from "@/lib/pricing";

const COOKIE = "eatrite_checkout";

export type CheckoutIntent = {
  userId: string;
  planId: string;
  period: BillingPeriod;
  frequency: DeliveryFrequency;
  location: DeliveryLocation;
  address: string;
  amount: number;
  reference: string;
};

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
