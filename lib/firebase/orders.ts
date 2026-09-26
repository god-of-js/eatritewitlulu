import { getFirebaseProjectId } from "@/lib/firebase/config";
import type { MenuOrder, OrderItem, OrderStatus } from "@/lib/types";

type EncodedValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { arrayValue: { values?: EncodedValue[] } }
  | { mapValue: { fields?: Record<string, EncodedValue> } };

type FirestoreDocument = {
  name: string;
  fields?: Record<string, EncodedValue>;
};

function firestoreRoot() {
  return `https://firestore.googleapis.com/v1/projects/${getFirebaseProjectId()}/databases/(default)/documents`;
}

function encodeValue(value: unknown): EncodedValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (typeof value === "string") return { stringValue: value };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(encodeValue) } };
  }
  return {
    mapValue: {
      fields: Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, item]) => [
          key,
          encodeValue(item),
        ]),
      ),
    },
  };
}

function decodeValue(value: EncodedValue): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) {
    return (value.arrayValue.values ?? []).map(decodeValue);
  }
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields ?? {}).map(([key, item]) => [
        key,
        decodeValue(item),
      ]),
    );
  }
  return null;
}

function documentId(name: string) {
  return decodeURIComponent(name.split("/").pop() ?? "");
}

function fromOrderItem(value: unknown): OrderItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const mealId = String(item.meal_id ?? "");
  const name = String(item.name ?? "");
  const quantity = Number(item.quantity ?? 0);
  if (!mealId || !name || quantity < 1) return null;
  return {
    meal_id: mealId,
    name,
    image_url: String(item.image_url ?? ""),
    price: Number(item.price ?? 0),
    quantity,
  };
}

function fromOrder(doc: FirestoreDocument): MenuOrder {
  const fields = Object.fromEntries(
    Object.entries(doc.fields ?? {}).map(([key, value]) => [
      key,
      decodeValue(value),
    ]),
  );
  const items = Array.isArray(fields.items)
    ? fields.items.map(fromOrderItem).filter((item): item is OrderItem => Boolean(item))
    : [];
  const status = fields.status === "fulfilled" ? "fulfilled" : "pending";

  return {
    id: documentId(doc.name),
    user_id: String(fields.user_id ?? ""),
    customer_name: String(fields.customer_name ?? ""),
    customer_email: fields.customer_email ? String(fields.customer_email) : null,
    customer_phone: fields.customer_phone ? String(fields.customer_phone) : null,
    delivery_address: String(fields.delivery_address ?? ""),
    delivery_location:
      fields.delivery_location === "mainland" || fields.delivery_location === "island"
        ? fields.delivery_location
        : null,
    delivery_fee: Number(fields.delivery_fee ?? 0),
    items,
    item_count: Number(fields.item_count ?? items.reduce((sum, item) => sum + item.quantity, 0)),
    total_amount: Number(fields.total_amount ?? 0),
    status,
    payment_status:
      fields.payment_status === "success" || fields.payment_status === "failed"
        ? fields.payment_status
        : "pending",
    paystack_reference: fields.paystack_reference
      ? String(fields.paystack_reference)
      : null,
    created_at: String(fields.created_at ?? ""),
    fulfilled_at: fields.fulfilled_at ? String(fields.fulfilled_at) : null,
  };
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
  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string };
  } & Record<string, unknown>;
  if (!response.ok) {
    throw new Error(payload.error?.message || "Order request failed.");
  }
  return payload;
}

export async function createMenuOrder(
  token: string,
  data: Omit<MenuOrder, "id">,
) {
  const payload = await firestoreJson(token, "/orders", {
    method: "POST",
    body: JSON.stringify({
      fields: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, encodeValue(value)]),
      ),
    }),
  });
  if (!payload.name) {
    throw new Error("Could not save the order.");
  }
  return fromOrder(payload as FirestoreDocument);
}

export async function listAllOrders(token: string) {
  const payload = (await firestoreJson(token, "/orders?pageSize=100")) as {
    documents?: FirestoreDocument[];
  };
  return (payload.documents ?? [])
    .map(fromOrder)
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
}

export async function listUserOrders(token: string, userId: string) {
  const payload = (await firestoreJson(token, ":runQuery", {
    method: "POST",
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "orders" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "user_id" },
            op: "EQUAL",
            value: { stringValue: userId },
          },
        },
      },
    }),
  })) as { document?: FirestoreDocument }[] | { error?: { message?: string } };

  if (!Array.isArray(payload)) {
    throw new Error(payload.error?.message || "Could not load orders.");
  }

  return payload
    .map((row) => row.document)
    .filter((doc): doc is FirestoreDocument => Boolean(doc?.name))
    .map(fromOrder)
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
}

export async function getOrderByReference(token: string, reference: string) {
  const payload = (await firestoreJson(token, ":runQuery", {
    method: "POST",
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "orders" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "paystack_reference" },
            op: "EQUAL",
            value: { stringValue: reference },
          },
        },
        limit: 1,
      },
    }),
  })) as { document?: FirestoreDocument }[] | { error?: { message?: string } };

  if (!Array.isArray(payload)) return null;
  const doc = payload.find((row) => row.document?.name)?.document;
  return doc ? fromOrder(doc) : null;
}

export async function getOrder(token: string, id: string) {
  try {
    const payload = await firestoreJson(token, `/orders/${encodeURIComponent(id)}`);
    if (!payload.name) return null;
    return fromOrder(payload as FirestoreDocument);
  } catch {
    return null;
  }
}

export async function updateOrderStatus(
  token: string,
  id: string,
  status: OrderStatus,
) {
  const fulfilledAt = status === "fulfilled" ? new Date().toISOString() : null;
  const payload = await firestoreJson(
    token,
    `/orders/${encodeURIComponent(id)}?updateMask.fieldPaths=status&updateMask.fieldPaths=fulfilled_at`,
    {
      method: "PATCH",
      body: JSON.stringify({
        fields: {
          status: encodeValue(status),
          fulfilled_at: encodeValue(fulfilledAt),
        },
      }),
    },
  );
  return fromOrder(payload as FirestoreDocument);
}
