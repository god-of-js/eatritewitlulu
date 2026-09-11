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

function toValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  return { stringValue: String(value) };
}

function toFields(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, toValue(value)]),
  );
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

function fromDocument<T>(doc: FirestoreDocument) {
  const fields = Object.fromEntries(
    Object.entries(doc.fields ?? {}).map(([key, value]) => [
      key,
      fromValue(value),
    ]),
  );
  return { id: documentId(doc.name), ...fields } as T;
}

async function firestoreFetch(
  token: string,
  path: string,
  init?: RequestInit,
) {
  const response = await fetch(`${firestoreRoot()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: { message?: string; status?: string };
  } & Record<string, unknown>;

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(
      payload.error?.message || "Firestore request failed. Create the database and publish the security rules.",
    );
  }
  return payload;
}

export async function getProfile(token: string, userId: string) {
  const payload = await firestoreFetch(token, `/users/${userId}`);
  if (!payload?.name) return null;
  return fromDocument<Profile>(payload as FirestoreDocument);
}

export async function upsertProfile(
  token: string,
  userId: string,
  data: Omit<Profile, "id">,
  onlyIfMissing = false,
) {
  if (onlyIfMissing) {
    const existing = await getProfile(token, userId);
    if (existing) return existing;
  }

  const payload = await firestoreFetch(token, `/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: toFields(data) }),
  });
  if (!payload?.name) {
    throw new Error("Could not save your profile.");
  }
  return fromDocument<Profile>(payload as FirestoreDocument);
}

export async function listSubscriptions(token: string, userId: string) {
  const payload = await firestoreFetch(
    token,
    `/users/${userId}/subscriptions?pageSize=100`,
  );
  if (!payload) return [];
  const documents = (payload.documents ?? []) as FirestoreDocument[];
  return documents
    .map((doc) => fromDocument<Subscription>(doc))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getSubscription(
  token: string,
  userId: string,
  id: string,
) {
  const payload = await firestoreFetch(
    token,
    `/users/${userId}/subscriptions/${id}`,
  );
  if (!payload?.name) return null;
  return fromDocument<Subscription>(payload as FirestoreDocument);
}

export async function createSubscription(
  token: string,
  userId: string,
  data: Omit<Subscription, "id">,
) {
  const payload = await firestoreFetch(token, `/users/${userId}/subscriptions`, {
    method: "POST",
    body: JSON.stringify({ fields: toFields(data) }),
  });
  if (!payload?.name) {
    throw new Error("Could not save your subscription.");
  }
  return fromDocument<Subscription>(payload as FirestoreDocument);
}

export async function listTransactions(token: string, userId: string) {
  const payload = await firestoreFetch(
    token,
    `/users/${userId}/transactions?pageSize=100`,
  );
  if (!payload) return [];
  const documents = (payload.documents ?? []) as FirestoreDocument[];
  return documents
    .map((doc) => fromDocument<Transaction>(doc))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getTransaction(
  token: string,
  userId: string,
  id: string,
) {
  const payload = await firestoreFetch(
    token,
    `/users/${userId}/transactions/${encodeURIComponent(id)}`,
  );
  if (!payload?.name) return null;
  return fromDocument<Transaction>(payload as FirestoreDocument);
}

export async function createTransaction(
  token: string,
  userId: string,
  id: string,
  data: Omit<Transaction, "id">,
) {
  const payload = await firestoreFetch(
    token,
    `/users/${userId}/transactions?documentId=${encodeURIComponent(id)}`,
    {
      method: "POST",
      body: JSON.stringify({ fields: toFields(data) }),
    },
  );
  if (!payload?.name) {
    throw new Error("Could not save the payment record.");
  }
  return fromDocument<Transaction>(payload as FirestoreDocument);
}
