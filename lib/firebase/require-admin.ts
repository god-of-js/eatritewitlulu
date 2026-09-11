import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { persistAdminEmail, userIsAdmin } from "@/lib/firebase/admin-access";
import { ADMIN_FLAG_COOKIE, getSessionUser } from "@/lib/firebase/session";

export async function requireAdmin(next = "/admin") {
  const user = await getSessionUser();
  const granted = (await cookies()).get(ADMIN_FLAG_COOKIE)?.value ?? null;
  if (!user || !(await userIsAdmin(user, granted))) {
    redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  }
  try {
    await persistAdminEmail(user);
  } catch {
    // First access can still proceed on the session flag.
  }
  return user;
}
