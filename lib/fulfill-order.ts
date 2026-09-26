import { addDaysToDateInput, getPlanStartDateInput } from "@/lib/start-date";
import { getPlanById } from "@/lib/plans";
import { verifyPaystackTransaction } from "@/lib/paystack";
import {
  calculateOrder,
  isBillingPeriod,
  isDeliveryAddress,
  isDeliveryFrequency,
  isDeliveryLocation,
  normalizeDeliveryAddress,
  type BillingPeriod,
  type DeliveryFrequency,
  type DeliveryLocation,
} from "@/lib/pricing";
import {
  clearCheckoutIntent,
  getCheckoutIntent,
  isMenuCheckoutIntent,
} from "@/lib/checkout-intent";
import { getSessionUser } from "@/lib/firebase/session";
import {
  createSubscription,
  createTransaction,
  getTransaction,
} from "@/lib/firebase/firestore";
import { createMenuOrder, getOrderByReference } from "@/lib/firebase/orders";
import { quoteMenuCart } from "@/lib/menu-checkout";

type PaystackMetadata = {
  kind?: string;
  user_id?: string;
  plan_id?: string;
  billing_period?: string;
  delivery_frequency?: string;
  delivery_location?: string;
  delivery_address?: string;
  customer_name?: string;
  customer_phone?: string;
  custom_fields?: { variable_name?: string; value?: string }[];
};

function readMeta(raw: unknown): PaystackMetadata {
  if (!raw || typeof raw !== "object") return {};
  const meta = raw as PaystackMetadata;
  const fields = Array.isArray(meta.custom_fields) ? meta.custom_fields : [];
  const fromFields = Object.fromEntries(
    fields
      .filter((field) => field.variable_name && field.value)
      .map((field) => [field.variable_name as string, String(field.value)]),
  );
  return { ...fromFields, ...meta };
}

export async function fulfillPaidOrder(reference: string) {
  const user = await getSessionUser();

  if (!user) {
    return { ok: false as const, error: "Please log in to complete this payment.", code: "unauthenticated" };
  }

  let payment;
  try {
    payment = await verifyPaystackTransaction(reference);
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Unable to verify Paystack payment.",
      code: "verify-failed",
    };
  }

  if (payment.status !== "success") {
    return { ok: false as const, error: "Payment was not successful.", code: "payment-failed" };
  }

  const meta = readMeta(payment.metadata);
  const intent = await getCheckoutIntent();
  const sameIntent = intent && intent.reference === payment.reference && intent.userId === user.id;

  if (meta.user_id && meta.user_id !== user.id) {
    return { ok: false as const, error: "This payment belongs to another account.", code: "payment-mismatch" };
  }

  if (meta.kind === "menu" || (sameIntent && isMenuCheckoutIntent(intent))) {
    return fulfillMenuOrder(user, payment, meta, sameIntent && isMenuCheckoutIntent(intent) ? intent : null);
  }

  return fulfillPlanOrder(user, payment, meta, sameIntent && !isMenuCheckoutIntent(intent) ? intent : null);
}

async function fulfillMenuOrder(
  user: { id: string; email: string | null; token: string; name: string | null },
  payment: { reference: string; amount: number; status: string; paid_at: string | null },
  meta: PaystackMetadata,
  intent: {
    name: string;
    phone: string;
    address: string;
    location: DeliveryLocation;
    items: { mealId: string; quantity: number }[];
    amount: number;
  } | null,
) {
  const existingOrder = await getOrderByReference(user.token, payment.reference);
  if (existingOrder) {
    await clearCheckoutIntent();
    return { ok: true as const, kind: "menu" as const, orderId: existingOrder.id };
  }

  const existingTx = await getTransaction(user.token, user.id, payment.reference);
  if (existingTx) {
    await clearCheckoutIntent();
    return { ok: true as const, kind: "menu" as const, orderId: existingTx.subscription_id || "" };
  }

  const name = (meta.customer_name || intent?.name || user.name || "").trim();
  const phone = (meta.customer_phone || intent?.phone || "").trim();
  const address = normalizeDeliveryAddress(
    meta.delivery_address || intent?.address || "",
  );
  const location = (meta.delivery_location || intent?.location || "") as string;
  const items = intent?.items ?? [];

  if (
    !name ||
    !items.length ||
    !isDeliveryLocation(location) ||
    !isDeliveryAddress(address)
  ) {
    return { ok: false as const, error: "We could not match this payment to a menu order.", code: "invalid-order" };
  }

  const quote = await quoteMenuCart(items, location);
  if (!quote.items.length) {
    return { ok: false as const, error: "Those meals are no longer on the menu.", code: "invalid-order" };
  }
  if (payment.amount !== quote.total * 100) {
    return { ok: false as const, error: "Paid amount did not match the order total.", code: "amount-mismatch" };
  }

  const createdAt = new Date().toISOString();
  try {
    const order = await createMenuOrder(user.token, {
      user_id: user.id,
      customer_name: name,
      customer_email: user.email,
      customer_phone: phone || null,
      delivery_address: address,
      delivery_location: location,
      delivery_fee: quote.deliveryFee,
      items: quote.items,
      item_count: quote.itemCount,
      total_amount: quote.total,
      status: "pending",
      payment_status: "success",
      paystack_reference: payment.reference,
      created_at: createdAt,
      fulfilled_at: null,
    });

    await createTransaction(user.token, user.id, payment.reference, {
      user_id: user.id,
      subscription_id: order.id,
      amount: quote.total,
      payment_status: "success",
      paystack_reference: payment.reference,
      paystack_status: payment.status,
      plan_name: quote.items.map((item) => `${item.quantity} × ${item.name}`).join(", "),
      paid_at: payment.paid_at,
      created_at: createdAt,
    });

    await clearCheckoutIntent();
    return { ok: true as const, kind: "menu" as const, orderId: order.id };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Could not save your order.",
      code: "order-save",
    };
  }
}

async function fulfillPlanOrder(
  user: { id: string; token: string },
  payment: { reference: string; amount: number; status: string; paid_at: string | null },
  meta: PaystackMetadata,
  intent: {
    planId: string;
    period: BillingPeriod;
    frequency: DeliveryFrequency;
    location: DeliveryLocation;
    address: string;
  } | null,
) {
  const planId = meta.plan_id || intent?.planId || "";
  const period = (meta.billing_period || intent?.period || "") as string;
  const frequency = (meta.delivery_frequency || intent?.frequency || "") as string;
  const location = (meta.delivery_location || intent?.location || "") as string;
  const address = normalizeDeliveryAddress(
    meta.delivery_address || intent?.address || "",
  );

  const plan = planId ? getPlanById(planId) : undefined;
  if (
    !plan?.active ||
    !isBillingPeriod(period) ||
    !isDeliveryFrequency(frequency) ||
    !isDeliveryLocation(location) ||
    !isDeliveryAddress(address)
  ) {
    return { ok: false as const, error: "We could not match this payment to a meal plan.", code: "invalid-order" };
  }

  const order = calculateOrder(
    plan,
    frequency as DeliveryFrequency,
    location as DeliveryLocation,
    period as BillingPeriod,
  );

  if (payment.amount !== order.total * 100) {
    return { ok: false as const, error: "Paid amount did not match the order total.", code: "amount-mismatch" };
  }

  const existing = await getTransaction(user.token, user.id, payment.reference);
  if (existing) {
    await clearCheckoutIntent();
    return { ok: true as const, kind: "plan" as const, subscriptionId: existing.subscription_id };
  }

  const startDate = getPlanStartDateInput();
  const endDate = addDaysToDateInput(startDate, order.daysCovered);
  const createdAt = new Date().toISOString();

  try {
    const subscription = await createSubscription(user.token, user.id, {
      user_id: user.id,
      plan_id: plan.id,
      plan_name: plan.name,
      plan_type: plan.category,
      plan_price: order.planPrice,
      billing_period: period as BillingPeriod,
      calories: null,
      delivery_frequency: frequency as DeliveryFrequency,
      delivery_count: order.deliveryCount,
      delivery_location: location as DeliveryLocation,
      delivery_address: address,
      delivery_fee: order.deliveryFee,
      total_amount: order.total,
      status: "active",
      payment_status: "success",
      start_date: startDate,
      end_date: endDate,
      created_at: createdAt,
    });

    await createTransaction(user.token, user.id, payment.reference, {
      user_id: user.id,
      subscription_id: subscription.id,
      amount: order.total,
      payment_status: "success",
      paystack_reference: payment.reference,
      paystack_status: payment.status,
      plan_name: plan.name,
      paid_at: payment.paid_at,
      created_at: createdAt,
    });

    await clearCheckoutIntent();
    return { ok: true as const, kind: "plan" as const, subscriptionId: subscription.id };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Could not save your subscription.",
      code: "subscription-save",
    };
  }
}
