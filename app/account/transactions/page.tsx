import { SearchField } from "@/components/account/SearchField";
import { listTransactions } from "@/lib/firebase/firestore";
import { requireUser } from "@/lib/firebase/require-user";
import { formatPlanPrice } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const user = await requireUser("/account/transactions");
  const data = await listTransactions(user.token, user.id);
  const query = q.trim().toLowerCase();
  const transactions = data.filter((item) =>
    query
      ? [item.plan_name, item.paystack_reference, item.payment_status, item.created_at]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true,
  );

  return (
    <main>
      <h1 className="font-display text-3xl font-medium tracking-tight">Transactions</h1>
      <p className="mt-2 text-sm text-ink/60">
        Payments for your EatriteWithLulu subscriptions.
      </p>
      <div className="mt-6">
        <SearchField
          defaultValue={q}
          placeholder="Search by plan, reference or date"
        />
      </div>
      {transactions.length ? (
        <ul className="divide-y divide-ink/10 overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white">
          {transactions.map((item) => (
            <li key={item.id}>
              <a
                href={`/account/transactions/${item.id}`}
                className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <span>
                  <span className="block font-medium">
                    {item.plan_name ?? "Meal plan"}
                  </span>
                  <span className="text-sm text-ink/55">
                    {formatDate(item.created_at)}
                    {item.paystack_reference
                      ? ` · ${item.paystack_reference}`
                      : ""}
                  </span>
                </span>
                <span className="text-sm sm:text-right">
                  <span className="block font-semibold">
                    {formatPlanPrice(item.amount)}
                  </span>
                  <span className="capitalize text-ink/55">{item.payment_status}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink/60">No matching transactions.</p>
      )}
    </main>
  );
}
