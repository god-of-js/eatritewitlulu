import { NextResponse } from "next/server";
import { fulfillPaidOrder } from "@/lib/fulfill-order";
import { getSiteUrl } from "@/lib/config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  const site = getSiteUrl();

  if (!reference) {
    return NextResponse.redirect(`${site}/account?error=missing-reference`);
  }

  try {
    const result = await fulfillPaidOrder(reference);
    if (!result.ok) {
      if (result.code === "unauthenticated") {
        return NextResponse.redirect(
          `${site}/login?next=${encodeURIComponent(`/api/paystack/callback?reference=${reference}`)}`,
        );
      }
      return NextResponse.redirect(`${site}/account?error=${result.code}`);
    }

    return NextResponse.redirect(`${site}/account?paid=1`);
  } catch {
    return NextResponse.redirect(`${site}/account?error=verify-failed`);
  }
}
