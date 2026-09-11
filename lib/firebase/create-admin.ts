import { getAdminEmails } from "@/lib/admin";
import { listStoredAdminEmails, saveAdminEmails } from "@/lib/firebase/admin-access";
import { getFirebaseApiKey } from "@/lib/firebase/config";
import { upsertProfile } from "@/lib/firebase/firestore";
import type { AuthUser } from "@/lib/firebase/user";

function authErrorMessage(code: string | undefined) {
  if (code === "EMAIL_EXISTS") return "That email already has an account.";
  if (code === "INVALID_EMAIL") return "Enter a valid email address.";
  if (code?.startsWith("WEAK_PASSWORD")) {
    return "Password should be at least 6 characters.";
  }
  return "Could not create the admin.";
}

export async function createAdminAccount(
  actor: AuthUser,
  input: { name: string; email: string; password: string },
) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!name || !email || password.length < 6) {
    throw new Error("Enter a name, email, and a password with at least 6 characters.");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${getFirebaseApiKey()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        displayName: name,
        returnSecureToken: true,
      }),
      cache: "no-store",
    },
  );
  const payload = (await response.json()) as {
    localId?: string;
    idToken?: string;
    error?: { message?: string };
  };

  if (!response.ok || !payload.localId || !payload.idToken) {
    throw new Error(authErrorMessage(payload.error?.message));
  }

  await upsertProfile(payload.idToken, payload.localId, {
    full_name: name,
    phone: null,
    email,
    deleted_at: null,
  });

  const existing = await listStoredAdminEmails(actor.token);
  try {
    await saveAdminEmails(actor.token, [
      ...existing,
      ...getAdminEmails(),
      actor.email,
      email,
    ]);
  } catch {
    throw new Error(
      "Account created, but it could not be added to the admin list. Publish firebase/firestore.rules and try again.",
    );
  }

  return { id: payload.localId, name, email };
}
