import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSiteUrl } from "@/lib/config";
import { ADMIN_FLAG_COOKIE, SESSION_COOKIE } from "@/lib/firebase/session";

export async function POST() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(ADMIN_FLAG_COOKIE);
  return NextResponse.redirect(new URL("/login", getSiteUrl()), {
    status: 303,
  });
}
