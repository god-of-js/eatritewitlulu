import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { Footer } from "@/components/marketing/Footer";
import { Header } from "@/components/marketing/Header";
import { Container } from "@/components/ui/Container";
import { getProfile } from "@/lib/firebase/firestore";
import { requireUser } from "@/lib/firebase/require-user";
import { isDeliveryLocation } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Place an order from the EatriteWithLulu menu.",
};

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const profile = await getProfile(user.token, user.id).catch(() => null);

  return (
    <>
      <Header variant="solid" />
      <main id="main" className="bg-cream text-ink">
        <section className="pt-28 pb-16 md:pt-36 md:pb-24">
          <Container>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sage-deep">
              Checkout
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
              Place your order
            </h1>
            <p className="mt-4 max-w-2xl text-base text-ink/70">
              Pay with Paystack, then we’ll deliver to the address you give us.
            </p>
            <CheckoutForm
              name={profile?.full_name || user.name || ""}
              phone={profile?.phone || ""}
              address={profile?.delivery_address || ""}
              location={
                profile?.delivery_location && isDeliveryLocation(profile.delivery_location)
                  ? profile.delivery_location
                  : "island"
              }
            />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
