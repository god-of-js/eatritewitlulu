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
} from "@/lib/checkout-intent";
import { getSessionUser } from "@/lib/firebase/session";
import {
  createSubscription,
  createTransaction,
  getTransaction,
} from "@/lib/firebase/firestore";

type PaystackMetadata = {
  user_id?: string;
  plan_id?: string;
  billing_period?: string;
  delivery_frequency?: string;
  delivery_location?: string;
  delivery_address?: string;
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

  const planId = meta.plan_id || (sameIntent ? intent.planId : "");
  const period = (meta.billing_period ||
    (sameIntent ? intent.period : "")) as string;
  const frequency = (meta.delivery_frequency ||
    (sameIntent ? intent.frequency : "")) as string;
  const location = (meta.delivery_location ||
    (sameIntent ? intent.location : "")) as string;
  const address = normalizeDeliveryAddress(
    meta.delivery_address || (sameIntent ? intent.address : ""),
  );

  if (meta.user_id && meta.user_id !== user.id) {
    return { ok: false as const, error: "This payment belongs to another account.", code: "payment-mismatch" };
  }

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
    return { ok: true as const, subscriptionId: existing.subscription_id };
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
    return { ok: true as const, subscriptionId: subscription.id };
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
