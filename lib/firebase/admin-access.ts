import { getAdminEmails, isAdminEmail } from "@/lib/admin";
import { getFirebaseProjectId } from "@/lib/firebase/config";
import type { AuthUser } from "@/lib/firebase/user";

function adminsDocUrl() {
  return `https://firestore.googleapis.com/v1/projects/${getFirebaseProjectId()}/databases/(default)/documents/settings/admins`;
}

function emailsFromDocument(payload: {
  fields?: {
    emails?: { arrayValue?: { values?: { stringValue?: string }[] } };
  };
}) {
  return (payload.fields?.emails?.arrayValue?.values ?? [])
    .map((value) => value.stringValue?.trim().toLowerCase() ?? "")
    .filter(Boolean);
}

export async function listStoredAdminEmails(token: string) {
  const response = await fetch(adminsDocUrl(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (response.status === 404) return [];
  if (!response.ok) return [];
  const payload = (await response.json()) as {
    fields?: {
      emails?: { arrayValue?: { values?: { stringValue?: string }[] } };
    };
  };
  return emailsFromDocument(payload);
}

function uniqueEmails(emails: (string | null | undefined)[]) {
  return [
    ...new Set(
      emails
        .map((email) => email?.trim().toLowerCase() ?? "")
        .filter(Boolean),
    ),
  ];
}

export async function saveAdminEmails(token: string, emails: string[]) {
  const response = await fetch(adminsDocUrl(), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        emails: {
          arrayValue: {
            values: uniqueEmails(emails).map((email) => ({
              stringValue: email,
            })),
          },
        },
      },
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Could not update the admin list.");
  }
}

export async function persistAdminEmail(user: AuthUser) {
  if (!user.email) return;
  const email = user.email.trim().toLowerCase();
  const existing = await listStoredAdminEmails(user.token);
  if (existing.includes(email)) return;
  await saveAdminEmails(user.token, [...existing, ...getAdminEmails(), email]);
}

export async function listAdminEmails(user: AuthUser) {
  const stored = await listStoredAdminEmails(user.token);
  return uniqueEmails([...getAdminEmails(), ...stored, user.email]);
}

export async function userIsAdmin(
  user: AuthUser | null,
  grantedEmail?: string | null,
) {
  if (!user?.email) return false;
  const email = user.email.trim().toLowerCase();
  if (isAdminEmail(email)) return true;
  if (grantedEmail?.trim().toLowerCase() === email) return true;
  const emails = await listStoredAdminEmails(user.token);
  return emails.includes(email);
}
