import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { persistAdminEmail, userIsAdmin } from "@/lib/firebase/admin-access";
import { ADMIN_FLAG_COOKIE, getSessionUser, sessionCookieOptions } from "@/lib/firebase/session";

export async function POST() {
  const store = await cookies();
  const user = await getSessionUser();
  const granted = store.get(ADMIN_FLAG_COOKIE)?.value ?? null;
  if (!user || !(await userIsAdmin(user, granted))) {
    return NextResponse.json({ admin: false }, { status: 401 });
  }

  try {
    await persistAdminEmail(user);
  } catch {
    // Cookie access still works if Firestore is not writable yet.
  }

  store.set(ADMIN_FLAG_COOKIE, user.email!.trim().toLowerCase(), sessionCookieOptions());
  return NextResponse.json({ admin: true });
}
