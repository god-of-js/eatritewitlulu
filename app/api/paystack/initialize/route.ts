import { NextResponse } from "next/server";
import { setCheckoutIntent } from "@/lib/checkout-intent";
import { saveDeliveryDetails } from "@/lib/firebase/firestore";
import { getSessionUser } from "@/lib/firebase/session";
import { parseMenuCheckoutItems, quoteMenuCart } from "@/lib/menu-checkout";
import {
  calculateOrder,
  isBillingPeriod,
  isDeliveryAddress,
  isDeliveryFrequency,
  isDeliveryLocation,
  normalizeDeliveryAddress,
} from "@/lib/pricing";
import { getPlanById } from "@/lib/plans";
import { initializePaystackTransaction } from "@/lib/paystack";

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  }

  const customer = {
    id: user.id,
    email: user.email,
    token: user.token,
  };

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json(
      { error: "Paystack public key is not configured." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as {
    kind?: string;
    planId?: string;
    period?: string;
    frequency?: string;
    location?: string;
    address?: string;
    name?: string;
    phone?: string;
    items?: unknown;
  };

  try {
    if (body.kind === "menu") {
      return await initializeMenuPayment(customer, publicKey, body);
    }
    return await initializePlanPayment(customer, publicKey, body);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function rememberDelivery(
  user: { id: string; token: string },
  details: {
    full_name?: string;
    phone?: string | null;
    delivery_address: string;
    delivery_location: "island" | "mainland";
  },
) {
  try {
    await saveDeliveryDetails(user.token, user.id, details);
  } catch {
    // Payment can still continue if the profile write fails.
  }
}

async function initializeMenuPayment(
  user: { id: string; email: string; token: string },
  publicKey: string,
  body: {
    location?: string;
    address?: string;
    name?: string;
    phone?: string;
    items?: unknown;
  },
) {
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const address = normalizeDeliveryAddress(body.address);
  const items = parseMenuCheckoutItems(body.items);

  if (!name) {
    return NextResponse.json({ error: "Enter the name for this order." }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: "Enter a phone number." }, { status: 400 });
  }
  if (!body.location || !isDeliveryLocation(body.location)) {
    return NextResponse.json({ error: "Choose a delivery location." }, { status: 400 });
  }
  if (!isDeliveryAddress(address)) {
    return NextResponse.json(
      { error: "Enter your full home address so we can deliver your meals." },
      { status: 400 },
    );
  }
  if (!items.length) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const quote = await quoteMenuCart(items, body.location);
  if (!quote.items.length) {
    return NextResponse.json(
      { error: "Those meals are no longer on the menu." },
      { status: 400 },
    );
  }

  await rememberDelivery(user, {
    full_name: name,
    phone,
    delivery_address: address,
    delivery_location: body.location,
  });

  const payment = await initializePaystackTransaction({
    email: user.email,
    amountNaira: quote.total,
    metadata: {
      kind: "menu",
      user_id: user.id,
      customer_name: name,
      customer_phone: phone,
      delivery_address: address,
      delivery_location: body.location,
      custom_fields: [
        { display_name: "User", variable_name: "user_id", value: user.id },
        { display_name: "Kind", variable_name: "kind", value: "menu" },
        { display_name: "Name", variable_name: "customer_name", value: name },
        { display_name: "Phone", variable_name: "customer_phone", value: phone },
        {
          display_name: "Location",
          variable_name: "delivery_location",
          value: body.location,
        },
        {
          display_name: "Address",
          variable_name: "delivery_address",
          value: address,
        },
      ],
    },
  });

  await setCheckoutIntent({
    kind: "menu",
    userId: user.id,
    name,
    phone,
    address,
    location: body.location,
    items: quote.items.map((item) => ({
      mealId: item.meal_id,
      quantity: item.quantity,
    })),
    amount: quote.total,
    reference: payment.reference,
  });

  return NextResponse.json({
    accessCode: payment.access_code,
    reference: payment.reference,
    publicKey,
    email: user.email,
    amount: quote.total,
  });
}

async function initializePlanPayment(
  user: { id: string; email: string; token: string },
  publicKey: string,
  body: {
    planId?: string;
    period?: string;
    frequency?: string;
    location?: string;
    address?: string;
  },
) {
  const plan = body.planId ? getPlanById(body.planId) : undefined;
  if (!plan?.active) {
    return NextResponse.json({ error: "That meal plan is not available." }, { status: 400 });
  }
  if (!body.period || !isBillingPeriod(body.period)) {
    return NextResponse.json({ error: "Choose a week or a month." }, { status: 400 });
  }
  if (!body.frequency || !isDeliveryFrequency(body.frequency)) {
    return NextResponse.json({ error: "Choose a delivery frequency." }, { status: 400 });
  }
  if (!body.location || !isDeliveryLocation(body.location)) {
    return NextResponse.json({ error: "Choose a delivery location." }, { status: 400 });
  }
  const address = normalizeDeliveryAddress(body.address);
  if (!isDeliveryAddress(address)) {
    return NextResponse.json(
      { error: "Enter your full home address so we can deliver your meals." },
      { status: 400 },
    );
  }

  const order = calculateOrder(plan, body.frequency, body.location, body.period);

  await rememberDelivery(user, {
    delivery_address: address,
    delivery_location: body.location,
  });

  const payment = await initializePaystackTransaction({
    email: user.email,
    amountNaira: order.total,
    metadata: {
      kind: "plan",
      user_id: user.id,
      plan_id: plan.id,
      billing_period: body.period,
      delivery_frequency: body.frequency,
      delivery_location: body.location,
      delivery_address: address,
      custom_fields: [
        { display_name: "User", variable_name: "user_id", value: user.id },
        { display_name: "Kind", variable_name: "kind", value: "plan" },
        { display_name: "Plan", variable_name: "plan_id", value: plan.id },
        {
          display_name: "Duration",
          variable_name: "billing_period",
          value: body.period,
        },
        {
          display_name: "Frequency",
          variable_name: "delivery_frequency",
          value: body.frequency,
        },
        {
          display_name: "Location",
          variable_name: "delivery_location",
          value: body.location,
        },
        {
          display_name: "Address",
          variable_name: "delivery_address",
          value: address,
        },
      ],
    },
  });

  await setCheckoutIntent({
    userId: user.id,
    planId: plan.id,
    period: body.period,
    frequency: body.frequency,
    location: body.location,
    address,
    amount: order.total,
    reference: payment.reference,
  });

  return NextResponse.json({
    accessCode: payment.access_code,
    reference: payment.reference,
    publicKey,
    email: user.email,
    amount: order.total,
  });
}
