import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/session";
import { upsertProfile } from "@/lib/firebase/firestore";

export async function requireUser(next = "/account") {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return user;
}

export async function requireUserAndProfile(next = "/account") {
  const user = await requireUser(next);
  try {
    await upsertProfile(
      user.token,
      user.id,
      {
        full_name: user.name ?? "",
        phone: null,
        email: user.email,
        deleted_at: null,
      },
      true,
    );
  } catch {
    // Firestore may not be created yet; account pages surface that error.
  }
  return user;
}
