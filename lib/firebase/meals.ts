import { getFirebaseApiKey, getFirebaseProjectId } from "@/lib/firebase/config";
import type { Meal } from "@/lib/types";

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

function fromMeal(doc: FirestoreDocument): Meal {
  const fields = Object.fromEntries(
    Object.entries(doc.fields ?? {}).map(([key, value]) => [
      key,
      fromValue(value),
    ]),
  );
  return {
    id: documentId(doc.name),
    name: String(fields.name ?? ""),
    image_url: String(fields.image_url ?? ""),
    price: Number(fields.price ?? 0),
    description: String(fields.description ?? ""),
    created_at: String(fields.created_at ?? ""),
  };
}

export async function listMeals() {
  const response = await fetch(
    `${firestoreRoot()}/meals?pageSize=100&key=${getFirebaseApiKey()}`,
    { cache: "no-store" },
  );
  const payload = (await response.json().catch(() => null)) as {
    documents?: FirestoreDocument[];
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
        "Could not load the menu. Publish firebase/firestore.rules.",
    );
  }

  return (payload?.documents ?? [])
    .map(fromMeal)
    .filter((meal) => meal.name)
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
}
