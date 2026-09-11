import { NextResponse } from "next/server";
import { setCheckoutIntent } from "@/lib/checkout-intent";
import { getSessionUser } from "@/lib/firebase/session";
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

  if (!user?.email) {
    return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json(
      { error: "Paystack public key is not configured." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as {
    planId?: string;
    period?: string;
    frequency?: string;
    location?: string;
    address?: string;
  };

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

  try {
    const payment = await initializePaystackTransaction({
      email: user.email,
      amountNaira: order.total,
      metadata: {
        user_id: user.id,
        plan_id: plan.id,
        billing_period: body.period,
        delivery_frequency: body.frequency,
        delivery_location: body.location,
        delivery_address: address,
        custom_fields: [
          { display_name: "User", variable_name: "user_id", value: user.id },
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
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
