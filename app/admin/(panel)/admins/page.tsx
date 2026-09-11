import { AddAdminForm } from "@/components/admin/AddAdminForm";
import { listAdminEmails } from "@/lib/firebase/admin-access";
import { listAllProfiles } from "@/lib/firebase/admin-data";
import { requireAdmin } from "@/lib/firebase/require-admin";

export default async function AdminAdminsPage() {
  const user = await requireAdmin("/admin/admins");
  const emails = await listAdminEmails(user);
  let profiles: Awaited<ReturnType<typeof listAllProfiles>> = [];

  try {
    profiles = await listAllProfiles(user.token);
  } catch {
    profiles = [];
  }

  const admins = emails.map((email) => {
    const profile = profiles.find(
      (item) => item.email?.trim().toLowerCase() === email,
    );
    return {
      email,
      name: profile?.full_name || "",
      current: email === user.email?.trim().toLowerCase(),
    };
  });

  return (
    <main>
      <h1 className="font-display text-3xl font-medium tracking-tight">Admins</h1>
      <p className="mt-2 text-sm text-ink/60">
        People who can open the admin dashboard.
      </p>

      {admins.length ? (
        <ul className="mt-8 divide-y divide-ink/10 overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white">
          {admins.map((item) => (
            <li key={item.email} className="px-5 py-4">
              <p className="font-medium">
                {item.name || item.email}
                {item.current ? (
                  <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-ink/45">
                    You
                  </span>
                ) : null}
              </p>
              {item.name ? (
                <p className="text-sm text-ink/55">{item.email}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-sm text-ink/60">No admins listed yet.</p>
      )}

      <h2 className="mt-10 text-lg font-semibold">Add admin</h2>
      <p className="mt-1 text-sm text-ink/60">
        Creates a new account they can use at /admin/login.
      </p>
      <AddAdminForm />
    </main>
  );
}
