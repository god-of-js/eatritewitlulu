import { getFirebaseProjectId } from "@/lib/firebase/config";
import type { Profile, Subscription, Transaction } from "@/lib/types";

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null };

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

function firestoreRoot() {
  return `https://firestore.googleapis.com/v1/projects/${getFirebaseProjectId()}/databases/(default)/documents`;
}

function fromValue(value: FirestoreValue): string | number | boolean | null {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  return null;
}

function documentId(name: string) {
  return decodeURIComponent(name.split("/").pop() ?? "");
}

function userIdFromName(name: string) {
  const match = name.match(/\/documents\/users\/([^/]+)\//);
  return match ? decodeURIComponent(match[1]) : "";
}

function fromDocument<T>(doc: FirestoreDocument) {
  const fields = Object.fromEntries(
    Object.entries(doc.fields ?? {}).map(([key, value]) => [
      key,
      fromValue(value),
    ]),
  );
  return { id: documentId(doc.name), ...fields } as T;
}

async function firestoreJson(token: string, path: string, init?: RequestInit) {
  const response = await fetch(`${firestoreRoot()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? (payload as { error?: { message?: string } }).error?.message
        : null;
    throw new Error(
      message ||
        "Admin data could not be loaded. Publish firebase/firestore.rules and create settings/admins.",
    );
  }
  return payload;
}

export async function listAllProfiles(token: string) {
  const payload = (await firestoreJson(token, "/users?pageSize=200")) as {
    documents?: FirestoreDocument[];
  } | null;
  const documents = payload?.documents ?? [];
  return documents
    .map((doc) => fromDocument<Profile>(doc))
    .sort((a, b) => (a.full_name || a.email || "").localeCompare(b.full_name || b.email || ""));
}

export async function listAllSubscriptions(token: string) {
  const payload = (await firestoreJson(token, ":runQuery", {
    method: "POST",
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "subscriptions", allDescendants: true }],
      },
    }),
  })) as { document?: FirestoreDocument }[] | null;

  return (payload ?? [])
    .map((row) => row.document)
    .filter((doc): doc is FirestoreDocument => Boolean(doc?.name))
    .map((doc) => {
      const item = fromDocument<Subscription>(doc);
      return { ...item, user_id: item.user_id || userIdFromName(doc.name) };
    })
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
}

export async function listAllTransactions(token: string) {
  const payload = (await firestoreJson(token, ":runQuery", {
    method: "POST",
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "transactions", allDescendants: true }],
      },
    }),
  })) as { document?: FirestoreDocument }[] | null;

  return (payload ?? [])
    .map((row) => row.document)
    .filter((doc): doc is FirestoreDocument => Boolean(doc?.name))
    .map((doc) => {
      const item = fromDocument<Transaction>(doc);
      return { ...item, user_id: item.user_id || userIdFromName(doc.name) };
    })
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
}

export async function loadAdminData(token: string) {
  const [profiles, subscriptions, transactions] = await Promise.all([
    listAllProfiles(token),
    listAllSubscriptions(token),
    listAllTransactions(token),
  ]);
  return { profiles, subscriptions, transactions };
}
