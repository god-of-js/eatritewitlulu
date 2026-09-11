import { formatPlanPrice } from "@/lib/plans";
import {
  getFrequencyLabel,
  getLocationLabel,
  type DeliveryFrequency,
  type DeliveryLocation,
} from "@/lib/pricing";
import type { Subscription } from "@/lib/types";
import { displayStatus, subscriptionPeriodLabel } from "@/lib/subscriptions";
import { formatDate } from "@/lib/utils";

export function SubscriptionCard({
  subscription,
  href,
}: {
  subscription: Subscription;
  href: string;
}) {
  const status = displayStatus(subscription);
  return (
    <a
      href={href}
      className="block rounded-[1.5rem] border border-ink/8 bg-white p-5 transition hover:border-ink/20"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold tracking-tight">{subscription.plan_name}</h3>
        <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold capitalize">
          {status}
        </span>
      </div>
      <p className="mt-2 text-sm text-ink/60">
        {subscriptionPeriodLabel(subscription)} · {formatDate(subscription.start_date)} –{" "}
        {formatDate(subscription.end_date)}
      </p>
      <p className="mt-1 text-sm text-ink/60">
        {getFrequencyLabel(subscription.delivery_frequency as DeliveryFrequency)} ·{" "}
        {getLocationLabel(subscription.delivery_location as DeliveryLocation)}
      </p>
      {subscription.delivery_address ? (
        <p className="mt-1 line-clamp-2 text-sm text-ink/60">
          {subscription.delivery_address}
        </p>
      ) : null}
      <p className="mt-3 font-display text-xl">
        {formatPlanPrice(subscription.total_amount)}
      </p>
    </a>
  );
}
