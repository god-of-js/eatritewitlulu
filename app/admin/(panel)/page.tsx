import Link from "next/link";
import { loadAdminData } from "@/lib/firebase/admin-data";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { formatPlanPrice } from "@/lib/plans";
import { displayStatus } from "@/lib/subscriptions";
import { formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const user = await requireAdmin();
  let setupError = "";
  let users = 0;
  let activePlans = 0;
  let payments = 0;
  let revenue = 0;
  let recentPayments: Awaited<ReturnType<typeof loadAdminData>>["transactions"] =
    [];
  let recentPlans: Awaited<ReturnType<typeof loadAdminData>>["subscriptions"] =
    [];

  try {
    const data = await loadAdminData(user.token);
    users = data.profiles.filter((item) => !item.deleted_at).length;
    const active = data.subscriptions.filter(
      (item) => displayStatus(item) === "active",
    );
    activePlans = active.length;
    const successful = data.transactions.filter(
      (item) => item.payment_status === "success",
    );
    payments = successful.length;
    revenue = successful.reduce((sum, item) => sum + (item.amount || 0), 0);
    recentPayments = data.transactions.slice(0, 5);
    recentPlans = active.slice(0, 5);
  } catch (err) {
    setupError =
      err instanceof Error
        ? err.message
        : "Could not load admin data from Firebase.";
  }

  const stats = [
    { label: "Customers", value: String(users), href: "/admin/users" },
    { label: "Active plans", value: String(activePlans), href: "/admin/plans" },
    { label: "Successful payments", value: String(payments), href: "/admin/payments" },
    { label: "Revenue", value: formatPlanPrice(revenue), href: "/admin/payments" },
  ];

  return (
    <main>
      <h1 className="font-display text-3xl font-medium tracking-tight">
        Admin dashboard
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Customers, active meal plans and payment history.
      </p>

      {setupError ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {setupError} Create a Firestore document at{" "}
          <code>settings/admins</code> with an <code>emails</code> array that
          includes your admin email, then publish{" "}
          <code>firebase/firestore.rules</code>.
        </p>
      ) : null}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-[1.75rem] border border-ink/8 bg-white p-5"
          >
            <p className="text-sm text-ink/55">{item.label}</p>
            <p className="mt-2 font-display text-3xl">{item.value}</p>
          </Link>
        ))}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active plans</h2>
          <Link href="/admin/plans" className="text-sm underline">
            View all
          </Link>
        </div>
        {recentPlans.length ? (
          <ul className="mt-4 divide-y divide-ink/10 overflow-hidden rounded-[1.5rem] border border-ink/8 bg-white">
            {recentPlans.map((item) => (
              <li key={`${item.user_id}-${item.id}`}>
                <a
                  href={`/admin/users/${item.user_id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 text-sm"
                >
                  <span>
                    <span className="block font-medium">{item.plan_name}</span>
                    <span className="text-ink/55">
                      {formatDate(item.start_date)} – {formatDate(item.end_date)}
                    </span>
                  </span>
                  <span className="text-right font-medium">
                    {formatPlanPrice(item.total_amount)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink/60">No active plans yet.</p>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent payments</h2>
          <Link href="/admin/payments" className="text-sm underline">
            View all
          </Link>
        </div>
        {recentPayments.length ? (
          <ul className="mt-4 divide-y divide-ink/10 overflow-hidden rounded-[1.5rem] border border-ink/8 bg-white">
            {recentPayments.map((item) => (
              <li key={`${item.user_id}-${item.id}`}>
                <a
                  href={`/admin/users/${item.user_id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 text-sm"
                >
                  <span>
                    <span className="block font-medium">
                      {item.plan_name ?? "Meal plan"}
                    </span>
                    <span className="text-ink/55">
                      {formatDate(item.created_at)}
                      {item.paystack_reference
                        ? ` · ${item.paystack_reference}`
                        : ""}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-medium">
                      {formatPlanPrice(item.amount)}
                    </span>
                    <span className="capitalize text-ink/55">
                      {item.payment_status}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink/60">No payments yet.</p>
        )}
      </section>
    </main>
  );
}
