import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubscription, getTransaction } from "@/lib/firebase/firestore";
import { requireUser } from "@/lib/firebase/require-user";
import { formatPlanPrice } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser("/account/transactions");
  const transaction = await getTransaction(user.token, user.id, id);
  if (!transaction) notFound();

  const subscription = transaction.subscription_id
    ? await getSubscription(user.token, user.id, transaction.subscription_id)
    : null;

  const rows = [
    ["Date", formatDate(transaction.created_at)],
    ["Meal plan", transaction.plan_name ?? "—"],
    ["Amount", formatPlanPrice(transaction.amount)],
    ["Payment status", transaction.payment_status],
    ["Paystack reference", transaction.paystack_reference ?? "—"],
    ["Paystack status", transaction.paystack_status ?? "—"],
    ["Subscription status", subscription?.status ?? "—"],
  ];

  return (
    <main>
      <Link href="/account/transactions" className="text-sm underline">
        Back to transactions
      </Link>
      <h1 className="mt-4 font-display text-3xl font-medium tracking-tight">
        Transaction details
      </h1>
      <dl className="mt-8 divide-y divide-ink/10 overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr]">
            <dt className="text-sm text-ink/55">{label}</dt>
            <dd className="text-sm font-medium break-all">{value}</dd>
          </div>
        ))}
      </dl>
      {subscription ? (
        <Link
          href={`/account/plans/${subscription.id}`}
          className="mt-6 inline-block text-sm underline"
        >
          View related meal plan
        </Link>
      ) : null}
    </main>
  );
}
