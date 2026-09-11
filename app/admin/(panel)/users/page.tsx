import { SearchField } from "@/components/account/SearchField";
import { loadAdminData } from "@/lib/firebase/admin-data";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { displayStatus } from "@/lib/subscriptions";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const user = await requireAdmin("/admin/users");
  const query = q.trim().toLowerCase();
  let users: {
    id: string;
    full_name: string;
    phone: string | null;
    email: string | null;
    deleted_at: string | null;
    planCount: number;
    activePlans: number;
    paymentCount: number;
  }[] = [];
  let setupError = "";

  try {
    const data = await loadAdminData(user.token);
    users = data.profiles
    .map((profile) => {
      const subscriptions = data.subscriptions.filter(
        (item) => item.user_id === profile.id,
      );
      const payments = data.transactions.filter(
        (item) => item.user_id === profile.id,
      );
      return {
        ...profile,
        planCount: subscriptions.length,
        activePlans: subscriptions.filter((item) => displayStatus(item) === "active")
          .length,
        paymentCount: payments.length,
      };
    })
    .filter((item) =>
      query
        ? [item.full_name, item.email, item.phone]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true,
    );
  } catch (err) {
    setupError =
      err instanceof Error ? err.message : "Could not load users.";
  }

  return (
    <main>
      <h1 className="font-display text-3xl font-medium tracking-tight">Users</h1>
      <p className="mt-2 text-sm text-ink/60">
        Everyone who has created an EatriteWithLulu account.
      </p>
      {setupError ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {setupError}
        </p>
      ) : null}
      <div className="mt-6">
        <SearchField defaultValue={q} placeholder="Search by name, email or phone" />
      </div>
      {users.length ? (
        <ul className="divide-y divide-ink/10 overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white">
          {users.map((item) => (
            <li key={item.id}>
              <a
                href={`/admin/users/${item.id}`}
                className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <span>
                  <span className="block font-medium">
                    {item.full_name || item.email || "Customer"}
                  </span>
                  <span className="text-sm text-ink/55">
                    {item.email ?? "—"}
                    {item.phone ? ` · ${item.phone}` : ""}
                  </span>
                </span>
                <span className="text-sm text-ink/60 sm:text-right">
                  {item.activePlans} active · {item.planCount} plans ·{" "}
                  {item.paymentCount} payments
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink/60">No matching users.</p>
      )}
    </main>
  );
}
