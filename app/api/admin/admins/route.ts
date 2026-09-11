import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { userIsAdmin } from "@/lib/firebase/admin-access";
import { createAdminAccount } from "@/lib/firebase/create-admin";
import { ADMIN_FLAG_COOKIE, getSessionUser } from "@/lib/firebase/session";

export async function POST(request: Request) {
  const user = await getSessionUser();
  const granted = (await cookies()).get(ADMIN_FLAG_COOKIE)?.value ?? null;
  if (!user || !(await userIsAdmin(user, granted))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  try {
    const admin = await createAdminAccount(user, {
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
    });
    return NextResponse.json({ admin });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not create the admin.",
      },
      { status: 400 },
    );
  }
}
