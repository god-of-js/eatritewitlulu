import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { userIsAdmin } from "@/lib/firebase/admin-access";
import { ADMIN_FLAG_COOKIE, getSessionUser } from "@/lib/firebase/session";

export async function GET() {
  const user = await getSessionUser();
  const granted = (await cookies()).get(ADMIN_FLAG_COOKIE)?.value ?? null;
  const admin = await userIsAdmin(user, granted);
  return NextResponse.json({ admin });
}
