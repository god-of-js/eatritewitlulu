import { notFound } from "next/navigation";
import Script from "next/script";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Container } from "@/components/ui/Container";
import { getProfile } from "@/lib/firebase/firestore";
import { getSessionUser } from "@/lib/firebase/session";
import { formatPlanPrice, getPlanById } from "@/lib/plans";
import { isDeliveryLocation } from "@/lib/pricing";

export default async function SubscribePage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const plan = getPlanById(planId);
  if (!plan || !plan.active) notFound();
  const user = await getSessionUser();
  const profile = user
    ? await getProfile(user.token, user.id).catch(() => null)
    : null;

  return (
    <>
      <Script src="https://js.paystack.co/v2/inline.js" strategy="afterInteractive" />
      <Header variant="solid" />
      <main id="main" className="bg-cream pt-28 pb-24 text-ink">
        <Container>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sage-deep">
            Subscribe
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
            {plan.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-ink/65">
            {plan.includes}. Pay for a week ({formatPlanPrice(plan.weeklyPrice)},{" "}
            {plan.mealsPerWeek} meals / {plan.daysPerWeek} days) or a month (
            {formatPlanPrice(plan.monthlyPrice)}, {plan.mealsPerMonth} meals /{" "}
            {plan.daysTotal} days). Choose delivery options, then pay with
            Paystack.
          </p>
          <div className="mt-10">
            <CheckoutForm
              plan={plan}
              address={profile?.delivery_address || ""}
              location={
                profile?.delivery_location && isDeliveryLocation(profile.delivery_location)
                  ? profile.delivery_location
                  : "island"
              }
            />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
