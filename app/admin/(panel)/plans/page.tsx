import { SearchField } from "@/components/account/SearchField";
import { loadAdminData } from "@/lib/firebase/admin-data";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { formatPlanPrice } from "@/lib/plans";
import { getFrequencyLabel, getLocationLabel } from "@/lib/pricing";
import { displayStatus, subscriptionPeriodLabel } from "@/lib/subscriptions";
import { formatDate } from "@/lib/utils";

export default async function AdminPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "active" } = await searchParams;
  const user = await requireAdmin("/admin/plans");
  const query = q.trim().toLowerCase();
  let setupError = "";
  let plans: Awaited<ReturnType<typeof loadAdminData>>["subscriptions"] = [];
  const profiles = new Map<
    string,
    Awaited<ReturnType<typeof loadAdminData>>["profiles"][number]
  >();

  try {
    const data = await loadAdminData(user.token);
    data.profiles.forEach((item) => profiles.set(item.id, item));
    plans = data.subscriptions.filter((item) => {
    const shown = displayStatus(item);
    if (status === "active" && shown !== "active") return false;
    if (status === "past" && shown === "active") return false;
    if (!query) return true;
    const owner = profiles.get(item.user_id);
    return [item.plan_name, item.status, owner?.full_name, owner?.email, item.delivery_address]
      .join(" ")
      .toLowerCase()
      .includes(query);
    });
  } catch (err) {
    setupError =
      err instanceof Error ? err.message : "Could not load plans.";
  }

  const statusQuery = q ? `&q=${encodeURIComponent(q)}` : "";

  return (
    <main>
      <h1 className="font-display text-3xl font-medium tracking-tight">Plans</h1>
      <p className="mt-2 text-sm text-ink/60">
        Meal plans across every customer account.
      </p>
      {setupError ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {setupError}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SearchField
          defaultValue={q}
          placeholder="Search plans, customers or addresses"
          hiddenFields={{ status }}
        />
        <div className="mb-6 flex gap-2">
          <a
            href={`/admin/plans?status=active${statusQuery}`}
            className={`rounded-full px-4 py-2 text-sm ${
              status === "active" ? "bg-ink text-cream" : "border border-ink/15"
            }`}
          >
            Active
          </a>
          <a
            href={`/admin/plans?status=all${statusQuery}`}
            className={`rounded-full px-4 py-2 text-sm ${
              status === "all" ? "bg-ink text-cream" : "border border-ink/15"
            }`}
          >
            All
          </a>
          <a
            href={`/admin/plans?status=past${statusQuery}`}
            className={`rounded-full px-4 py-2 text-sm ${
              status === "past" ? "bg-ink text-cream" : "border border-ink/15"
            }`}
          >
            Past
          </a>
        </div>
      </div>
      {plans.length ? (
        <ul className="divide-y divide-ink/10 overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white">
          {plans.map((item) => {
            const owner = profiles.get(item.user_id);
            return (
              <li key={`${item.user_id}-${item.id}`}>
                <a
                  href={`/admin/users/${item.user_id}`}
                  className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <span>
                    <span className="block font-medium">{item.plan_name}</span>
                    <span className="text-sm text-ink/55">
                      {owner?.full_name || owner?.email || item.user_id} ·{" "}
                      {subscriptionPeriodLabel(item)} · {displayStatus(item)}
                    </span>
                    <span className="mt-1 block text-sm text-ink/55">
                      {formatDate(item.start_date)} – {formatDate(item.end_date)} ·{" "}
                      {getFrequencyLabel(item.delivery_frequency)} ·{" "}
                      {getLocationLabel(item.delivery_location)}
                    </span>
                  </span>
                  <span className="text-sm font-semibold sm:text-right">
                    {formatPlanPrice(item.total_amount)}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-ink/60">No matching plans.</p>
      )}
    </main>
  );
}
