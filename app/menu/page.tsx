import type { Metadata } from "next";
import { Footer } from "@/components/marketing/Footer";
import { Header } from "@/components/marketing/Header";
import { MealCard } from "@/components/menu/MealCard";
import { Container } from "@/components/ui/Container";
import { listMeals } from "@/lib/firebase/meals";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "See the meals currently on the EatriteWithLulu menu — names, photos, prices and short descriptions.",
};

export default async function MenuPage() {
  let meals: Awaited<ReturnType<typeof listMeals>> = [];
  let loadError = "";

  try {
    meals = await listMeals();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not load the menu.";
  }

  return (
    <>
      <Header variant="solid" />
      <main id="main" className="bg-cream text-ink">
        <section className="pt-28 pb-16 md:pt-36 md:pb-24">
          <Container>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sage-deep">
              Menu
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
              Meals on the menu
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/70 sm:text-lg">
              Fresh dishes you can add to your week. Prices are per meal.
            </p>

            {loadError ? (
              <p className="mt-10 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {loadError}
              </p>
            ) : meals.length ? (
              <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {meals.map((meal) => (
                  <li key={meal.id}>
                    <MealCard meal={meal} shoppable />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-12 text-base text-ink/60">
                No meals on the menu yet. Check back soon.
              </p>
            )}
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
