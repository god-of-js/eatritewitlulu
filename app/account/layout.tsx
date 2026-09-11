import { cookies } from "next/headers";
import { AccountNav } from "@/components/account/AccountNav";
import { userIsAdmin } from "@/lib/firebase/admin-access";
import { requireUserAndProfile } from "@/lib/firebase/require-user";
import { ADMIN_FLAG_COOKIE } from "@/lib/firebase/session";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUserAndProfile();
  const granted = (await cookies()).get(ADMIN_FLAG_COOKIE)?.value ?? null;

  return (
    <div className="min-h-screen bg-cream text-ink lg:flex">
      <AccountNav isAdmin={await userIsAdmin(user, granted)} />
      <div className="flex-1 px-5 py-8 sm:px-8">{children}</div>
    </div>
  );
}
