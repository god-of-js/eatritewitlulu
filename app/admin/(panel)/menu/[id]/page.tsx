import Link from "next/link";
import { notFound } from "next/navigation";
import { MealForm } from "@/components/admin/MealForm";
import { getMeal } from "@/lib/firebase/meals";
import { requireAdmin } from "@/lib/firebase/require-admin";

export default async function AdminEditMealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin(`/admin/menu/${id}`);
  const meal = await getMeal(id);
  if (!meal) notFound();

  return (
    <main>
      <Link href="/admin/menu" className="text-sm underline">
        Back to menu
      </Link>
      <h1 className="mt-4 font-display text-3xl font-medium tracking-tight">
        Edit meal
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Update the name, photo, price or description.
      </p>
      <MealForm meal={meal} />
    </main>
  );
}
