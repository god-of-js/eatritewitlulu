import { addDays, toDateInput } from "@/lib/utils";
import { getBillingPeriodLabel, type BillingPeriod } from "@/lib/pricing";
import type { Subscription } from "@/lib/types";

export function subscriptionPeriod(subscription: Subscription): BillingPeriod {
  return subscription.billing_period === "week" ? "week" : "month";
}

export function subscriptionPeriodLabel(subscription: Subscription) {
  return getBillingPeriodLabel(subscriptionPeriod(subscription));
}

export function displayStatus(subscription: Subscription) {
  const end = new Date(subscription.end_date);
  end.setHours(23, 59, 59, 999);
  if (subscription.status === "active" && end < new Date()) {
    return "completed";
  }
  return subscription.status;
}

export function getNextDeliveryDate(subscription: Subscription, today = new Date()) {
  const start = new Date(`${subscription.start_date}T00:00:00`);
  const end = new Date(`${subscription.end_date}T23:59:59`);
  if (today > end || displayStatus(subscription) !== "active") return null;

  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);
  if (cursor < start) return toDateInput(start);

  if (subscription.delivery_frequency === "daily") {
    const tomorrow = addDays(cursor, 1);
    return tomorrow <= end ? toDateInput(tomorrow) : null;
  }

  if (subscription.delivery_frequency === "1x-week") {
    const next = new Date(start);
    while (next <= cursor) {
      next.setDate(next.getDate() + 7);
    }
    return next <= end ? toDateInput(next) : null;
  }

  const next = new Date(start);
  while (next <= cursor) {
    next.setDate(next.getDate() + 2);
  }
  return next <= end ? toDateInput(next) : null;
}
