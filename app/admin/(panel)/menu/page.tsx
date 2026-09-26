import { MealActions } from "@/components/admin/MealActions";
import { MealForm } from "@/components/admin/MealForm";
import { MealCard } from "@/components/menu/MealCard";
import { listMeals } from "@/lib/firebase/meals";
import { requireAdmin } from "@/lib/firebase/require-admin";

export default async function AdminMenuPage() {
  await requireAdmin("/admin/menu");
  let meals: Awaited<ReturnType<typeof listMeals>> = [];
  let setupError = "";

  try {
    meals = await listMeals();
  } catch (err) {
    setupError = err instanceof Error ? err.message : "Could not load meals.";
  }

  return (
    <main>
      <h1 className="font-display text-3xl font-medium tracking-tight">Menu</h1>
      <p className="mt-2 text-sm text-ink/60">
        Meals shown on the public menu page.
      </p>

      {setupError ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {setupError}
        </p>
      ) : null}

      {meals.length ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {meals.map((meal) => (
            <li key={meal.id}>
              <MealCard meal={meal} />
              <MealActions mealId={meal.id} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-sm text-ink/60">
          No meals yet. Add the first one below.
        </p>
      )}

      <h2 className="mt-10 text-lg font-semibold">Add meal</h2>
      <p className="mt-1 text-sm text-ink/60">
        Name, photo, price and a short description.
      </p>
      <MealForm />
    </main>
  );
}
