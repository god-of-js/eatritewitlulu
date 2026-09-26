import { SearchField } from "@/components/account/SearchField";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { listAllOrders } from "@/lib/firebase/orders";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { formatPlanPrice } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const user = await requireAdmin("/admin/orders");
  const query = q.trim().toLowerCase();
  let orders: Awaited<ReturnType<typeof listAllOrders>> = [];
  let setupError = "";

  try {
    orders = (await listAllOrders(user.token)).filter((item) =>
      query
        ? [
            item.customer_name,
            item.customer_email,
            item.customer_phone,
            item.status,
            item.delivery_address,
          ]
            .concat(item.items.map((line) => line.name))
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true,
    );
  } catch (err) {
    setupError = err instanceof Error ? err.message : "Could not load orders.";
  }

  return (
    <main>
      <h1 className="font-display text-3xl font-medium tracking-tight">Orders</h1>
      <p className="mt-2 text-sm text-ink/60">
        Every menu order. Mark an order fulfilled when it has been completed.
      </p>
      {setupError ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {setupError}
        </p>
      ) : null}
      <div className="mt-6">
        <SearchField
          defaultValue={q}
          placeholder="Search by customer, meal or status"
        />
      </div>
      {orders.length ? (
        <ul className="divide-y divide-ink/10 overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white">
          {orders.map((item) => (
            <li key={item.id}>
              <a
                href={`/admin/orders/${item.id}`}
                className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <span>
                  <span className="block font-medium">
                    {item.customer_name || item.customer_email || "Customer"}
                  </span>
                  <span className="text-sm text-ink/55">
                    {item.items.map((line) => `${line.quantity} × ${line.name}`).join(", ")}
                    {" · "}
                    {formatDate(item.created_at)}
                  </span>
                </span>
                <span className="flex items-center gap-3 sm:justify-end">
                  <StatusBadge status={item.status} />
                  <span className="text-sm font-semibold">
                    {formatPlanPrice(item.total_amount)}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink/60">No matching orders.</p>
      )}
    </main>
  );
}
