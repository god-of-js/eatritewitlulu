import Link from "next/link";
import { SubscriptionCard } from "@/components/account/SubscriptionCard";
import { SearchField } from "@/components/account/SearchField";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { listSubscriptions, listTransactions } from "@/lib/firebase/firestore";
import { requireUser } from "@/lib/firebase/require-user";
import { formatPlanPrice } from "@/lib/plans";
import { getFrequencyLabel, getLocationLabel } from "@/lib/pricing";
import {
  displayStatus,
  getNextDeliveryDate,
  subscriptionPeriodLabel,
} from "@/lib/subscriptions";
import { formatDate } from "@/lib/utils";

const PAYMENT_ERRORS: Record<string, string> = {
  "missing-reference": "That payment is missing a Paystack reference.",
  "payment-failed": "Paystack did not confirm this payment.",
  "payment-mismatch": "This payment belongs to another account.",
  "invalid-order": "We could not match this payment to a meal plan.",
  "amount-mismatch": "The amount paid did not match the order total.",
  "subscription-save": "Payment went through, but we could not save your plan.",
  "transaction-save": "Payment went through, but the transaction record could not be saved.",
  "verify-failed": "We could not verify this payment with Paystack.",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; paid?: string; error?: string }>;
}) {
  const { q = "", paid, error } = await searchParams;
  const user = await requireUser();
  let allSubs: Awaited<ReturnType<typeof listSubscriptions>> = [];
  let allTx: Awaited<ReturnType<typeof listTransactions>> = [];
  let setupError = "";
  try {
    [allSubs, allTx] = await Promise.all([
      listSubscriptions(user.token, user.id),
      listTransactions(user.token, user.id),
    ]);
  } catch (err) {
    setupError =
      err instanceof Error
        ? err.message
        : "Could not load your account from Firebase.";
  }

  const query = q.trim().toLowerCase();
  const filteredSubs = query
    ? allSubs.filter((item) =>
        [item.plan_name, item.status, item.start_date, item.end_date]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : allSubs;
  const filteredTx = query
    ? allTx.filter((item) =>
        [item.plan_name, item.paystack_reference, item.payment_status, item.created_at]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : allTx;

  const active = filteredSubs.find((item) => displayStatus(item) === "active");
  const past = filteredSubs.filter((item) => item.id !== active?.id);
  const nextDelivery = active ? getNextDeliveryDate(active) : null;

  return (
    <main>
      <h1 className="font-display text-3xl font-medium tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-ink/60">Your meal plans, payments and account.</p>

      {paid ? (
        <p className="mt-4 rounded-2xl bg-sage/20 px-4 py-3 text-sm text-sage-deep">
          Payment confirmed. Your meal plan is now active.
        </p>
      ) : null}
      {setupError ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {setupError} Create a Firestore database in the eatrite-admin project and
          publish firebase/firestore.rules.
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {PAYMENT_ERRORS[error] ??
            "We couldn't finish that payment. If you were charged, contact support with your Paystack reference."}
        </p>
      ) : null}

      <div className="mt-6">
        <SearchField
          defaultValue={q}
          placeholder="Search plans, dates or payment references"
        />
      </div>

      <section className="rounded-[1.75rem] border border-ink/8 bg-white p-6">
        <h2 className="text-lg font-semibold">Active meal plan</h2>
        {active ? (
          <div className="mt-4 grid gap-3 text-sm">
            <p className="font-display text-2xl">{active.plan_name}</p>
            <p className="capitalize text-ink/65">{active.plan_type} plan</p>
            <p>Duration: {subscriptionPeriodLabel(active)}</p>
            <p>Status: {displayStatus(active)}</p>
            <p>
              {formatDate(active.start_date)} – {formatDate(active.end_date)}
            </p>
            <p>
              {getFrequencyLabel(active.delivery_frequency)} · {active.delivery_count}{" "}
              deliveries · {getLocationLabel(active.delivery_location)}
            </p>
            {active.delivery_address ? (
              <p>Address: {active.delivery_address}</p>
            ) : null}
            <p>Delivery fee: {formatPlanPrice(active.delivery_fee)}</p>
            <p>Total: {formatPlanPrice(active.total_amount)}</p>
            {nextDelivery ? (
              <p>Next delivery: {formatDate(nextDelivery)}</p>
            ) : null}
            <ButtonLink
              href={`/account/plans/${active.id}`}
              variant="ghost"
              className="mt-2 w-fit"
            >
              View details
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-ink/65">You don&apos;t have an active plan yet.</p>
            <ButtonLink href="/#plans" variant="solid" className="mt-4 w-fit">
              Browse meal plans
            </ButtonLink>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Past meal plans</h2>
        {past.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {past.map((item) => (
              <SubscriptionCard
                key={item.id}
                subscription={item}
                href={`/account/plans/${item.id}`}
              />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink/60">No previous plans to show.</p>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent transactions</h2>
          <Link href="/account/transactions" className="text-sm underline">
            View all
          </Link>
        </div>
        {filteredTx.length ? (
          <ul className="mt-4 divide-y divide-ink/10 rounded-[1.5rem] border border-ink/8 bg-white">
            {filteredTx.slice(0, 5).map((item) => (
              <li key={item.id}>
                <a
                  href={`/account/transactions/${item.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 text-sm"
                >
                  <span>
                    <span className="block font-medium">
                      {item.plan_name ?? "Meal plan"}
                    </span>
                    <span className="text-ink/55">{formatDate(item.created_at)}</span>
                  </span>
                  <span className="text-right">
                    <span className="block font-medium">
                      {formatPlanPrice(item.amount)}
                    </span>
                    <span className="capitalize text-ink/55">{item.payment_status}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink/60">No transactions yet.</p>
        )}
      </section>
    </main>
  );
}
