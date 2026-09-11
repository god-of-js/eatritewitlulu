import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_FLAG_COOKIE,
  SESSION_COOKIE,
  decodeSessionToken,
  sessionCookieOptions,
} from "@/lib/firebase/session";

export async function POST(request: Request) {
  const body = (await request.json()) as { idToken?: string };
  if (!body.idToken || !decodeSessionToken(body.idToken)) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, body.idToken, sessionCookieOptions());
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(ADMIN_FLAG_COOKIE);
  return NextResponse.json({ ok: true });
}
