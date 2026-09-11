import { NextResponse } from "next/server";
import { fulfillPaidOrder } from "@/lib/fulfill-order";

export async function POST(request: Request) {
  const body = (await request.json()) as { reference?: string };
  if (!body.reference) {
    return NextResponse.json(
      { error: "Missing payment reference." },
      { status: 400 },
    );
  }

  try {
    const result = await fulfillPaidOrder(body.reference);
    if (!result.ok) {
      const status = result.code === "unauthenticated" ? 401 : 400;
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status },
      );
    }

    return NextResponse.json({
      ok: true,
      subscriptionId: result.subscriptionId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to confirm payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
