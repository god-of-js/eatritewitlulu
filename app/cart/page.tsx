import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { Footer } from "@/components/marketing/Footer";
import { Header } from "@/components/marketing/Header";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review meals in your EatriteWithLulu cart before placing an order.",
};

export default function CartPage() {
  return (
    <>
      <Header variant="solid" />
      <main id="main" className="bg-cream text-ink">
        <section className="pt-28 pb-16 md:pt-36 md:pb-24">
          <Container>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sage-deep">
              Cart
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
              Your cart
            </h1>
            <p className="mt-4 max-w-2xl text-base text-ink/70">
              Check quantities, then place your order.
            </p>
            <CartView />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
