import Link from "next/link";
import { notFound } from "next/navigation";
import { loadAdminData } from "@/lib/firebase/admin-data";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { formatPlanPrice } from "@/lib/plans";
import { getFrequencyLabel, getLocationLabel } from "@/lib/pricing";
import { displayStatus, subscriptionPeriodLabel } from "@/lib/subscriptions";
import { formatDate } from "@/lib/utils";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = await requireAdmin("/admin/users");
  let data;
  try {
    data = await loadAdminData(admin.token);
  } catch {
    notFound();
  }
  const profile = data.profiles.find((item) => item.id === id);
  if (!profile) notFound();

  const subscriptions = data.subscriptions.filter((item) => item.user_id === id);
  const transactions = data.transactions.filter((item) => item.user_id === id);

  return (
    <main>
      <Link href="/admin/users" className="text-sm underline">
        Back to users
      </Link>
      <h1 className="mt-4 font-display text-3xl font-medium tracking-tight">
        {profile.full_name || profile.email || "Customer"}
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        {profile.email ?? "No email"} · {profile.phone || "No phone"}
        {profile.deleted_at ? " · Deleted" : ""}
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Plans</h2>
        {subscriptions.length ? (
          <ul className="mt-4 divide-y divide-ink/10 overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white">
            {subscriptions.map((item) => (
              <li key={item.id} className="grid gap-1 px-5 py-4 text-sm">
                <p className="font-medium">{item.plan_name}</p>
                <p className="capitalize text-ink/55">
                  {subscriptionPeriodLabel(item)} · {displayStatus(item)} ·{" "}
                  {getFrequencyLabel(item.delivery_frequency)} ·{" "}
                  {getLocationLabel(item.delivery_location)}
                </p>
                <p className="text-ink/55">
                  {formatDate(item.start_date)} – {formatDate(item.end_date)}
                </p>
                {item.delivery_address ? (
                  <p className="text-ink/55">{item.delivery_address}</p>
                ) : null}
                <p className="font-medium">{formatPlanPrice(item.total_amount)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink/60">No plans for this user.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Payments</h2>
        {transactions.length ? (
          <ul className="mt-4 divide-y divide-ink/10 overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white">
            {transactions.map((item) => (
              <li
                key={item.id}
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
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink/60">No payments for this user.</p>
        )}
      </section>
    </main>
  );
}
