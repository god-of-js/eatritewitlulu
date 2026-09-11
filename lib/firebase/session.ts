import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { getFirebaseApiKey } from "@/lib/firebase/config";
import type { AuthUser } from "@/lib/firebase/user";

export const SESSION_COOKIE = "eatrite_session";
export const ADMIN_FLAG_COOKIE = "eatrite_admin";

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 5,
  };
}

type TokenPayload = {
  user_id?: string;
  sub?: string;
  email?: string;
  name?: string;
  exp?: number;
};

export function decodeSessionToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"),
    ) as TokenPayload;
    const id = payload.user_id || payload.sub;
    if (!id) return null;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return {
      id,
      email: payload.email ?? null,
      name: payload.name ?? null,
      token,
    };
  } catch {
    return null;
  }
}

export function peekSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSessionToken(token);
}

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const peeked = decodeSessionToken(token);
  if (!peeked) return null;

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${getFirebaseApiKey()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
      cache: "no-store",
    },
  );
  const payload = (await response.json()) as {
    users?: { localId?: string; email?: string; displayName?: string }[];
    error?: { message?: string };
  };

  const record = payload.users?.[0];
  if (!response.ok || !record?.localId) return null;

  return {
    id: record.localId,
    email: record.email ?? peeked.email,
    name: record.displayName ?? peeked.name,
    token,
  } satisfies AuthUser;
}
