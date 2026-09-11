import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubscription } from "@/lib/firebase/firestore";
import { requireUser } from "@/lib/firebase/require-user";
import { formatPlanPrice, getPlanById } from "@/lib/plans";
import { getFrequencyLabel, getLocationLabel } from "@/lib/pricing";
import {
  displayStatus,
  getNextDeliveryDate,
  subscriptionPeriodLabel,
} from "@/lib/subscriptions";
import { formatDate } from "@/lib/utils";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser("/account/plans");
  const subscription = await getSubscription(user.token, user.id, id);
  if (!subscription) notFound();

  const catalogPlan = getPlanById(subscription.plan_id);
  const nextDelivery = getNextDeliveryDate(subscription);

  const rows = [
    ["Meal plan", subscription.plan_name],
    ["Plan type", subscription.plan_type],
    ["Calories", subscription.calories ? `${subscription.calories}` : "Not specified"],
    ["Includes", catalogPlan?.includes ?? "—"],
    ["Duration", subscriptionPeriodLabel(subscription)],
    ["Plan price", formatPlanPrice(subscription.plan_price)],
    ["Delivery frequency", getFrequencyLabel(subscription.delivery_frequency)],
    ["Number of deliveries", String(subscription.delivery_count)],
    ["Delivery location", getLocationLabel(subscription.delivery_location)],
    ["Home address", subscription.delivery_address || "—"],
    ["Delivery fee", formatPlanPrice(subscription.delivery_fee)],
    ["Total amount", formatPlanPrice(subscription.total_amount)],
    ["Start date", formatDate(subscription.start_date)],
    ["End date", formatDate(subscription.end_date)],
    ["Subscription status", displayStatus(subscription)],
    ["Payment status", subscription.payment_status],
    ["Next delivery", nextDelivery ? formatDate(nextDelivery) : "None scheduled"],
  ];

  return (
    <main>
      <Link href="/account/plans" className="text-sm underline">
        Back to meal plans
      </Link>
      <h1 className="mt-4 font-display text-3xl font-medium tracking-tight">
        {subscription.plan_name}
      </h1>
      <dl className="mt-8 divide-y divide-ink/10 overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr]">
            <dt className="text-sm text-ink/55">{label}</dt>
            <dd className={`text-sm font-medium ${label === "Home address" ? "normal-case" : "capitalize"}`}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
