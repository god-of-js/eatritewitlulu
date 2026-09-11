import { SearchField } from "@/components/account/SearchField";
import { loadAdminData } from "@/lib/firebase/admin-data";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { formatPlanPrice } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const user = await requireAdmin("/admin/payments");
  const query = q.trim().toLowerCase();
  let setupError = "";
  let payments: Awaited<ReturnType<typeof loadAdminData>>["transactions"] = [];
  const profiles = new Map<
    string,
    Awaited<ReturnType<typeof loadAdminData>>["profiles"][number]
  >();

  try {
    const data = await loadAdminData(user.token);
    data.profiles.forEach((item) => profiles.set(item.id, item));
    payments = data.transactions.filter((item) => {
    if (!query) return true;
    const owner = profiles.get(item.user_id);
    return [
      item.plan_name,
      item.paystack_reference,
      item.payment_status,
      owner?.full_name,
      owner?.email,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
    });
  } catch (err) {
    setupError =
      err instanceof Error ? err.message : "Could not load payments.";
  }

  return (
    <main>
      <h1 className="font-display text-3xl font-medium tracking-tight">
        Payment history
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Every Paystack charge saved to a customer account.
      </p>
      {setupError ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {setupError}
        </p>
      ) : null}
      <div className="mt-6">
        <SearchField
          defaultValue={q}
          placeholder="Search by customer, plan or Paystack reference"
        />
      </div>
      {payments.length ? (
        <ul className="divide-y divide-ink/10 overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white">
          {payments.map((item) => {
            const owner = profiles.get(item.user_id);
            return (
              <li key={`${item.user_id}-${item.id}`}>
                <a
                  href={`/admin/users/${item.user_id}`}
                  className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <span>
                    <span className="block font-medium">
                      {item.plan_name ?? "Meal plan"}
                    </span>
                    <span className="text-sm text-ink/55">
                      {owner?.full_name || owner?.email || item.user_id} ·{" "}
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
                    <span className="capitalize text-ink/55">
                      {item.payment_status}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-ink/60">No matching payments.</p>
      )}
    </main>
  );
}
