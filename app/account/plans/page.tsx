import { SubscriptionCard } from "@/components/account/SubscriptionCard";
import { SearchField } from "@/components/account/SearchField";
import { listSubscriptions } from "@/lib/firebase/firestore";
import { requireUser } from "@/lib/firebase/require-user";

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const user = await requireUser("/account/plans");
  const data = await listSubscriptions(user.token, user.id);
  const query = q.trim().toLowerCase();
  const subscriptions = data.filter((item) =>
    query
      ? [item.plan_name, item.status, item.start_date, item.end_date]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true,
  );

  return (
    <main>
      <h1 className="font-display text-3xl font-medium tracking-tight">Meal plans</h1>
      <p className="mt-2 text-sm text-ink/60">Active and previous subscriptions.</p>
      <div className="mt-6">
        <SearchField defaultValue={q} placeholder="Search by plan name or date" />
      </div>
      {subscriptions.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {subscriptions.map((item) => (
            <SubscriptionCard
              key={item.id}
              subscription={item}
              href={`/account/plans/${item.id}`}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink/60">No matching meal plans.</p>
      )}
    </main>
  );
}
