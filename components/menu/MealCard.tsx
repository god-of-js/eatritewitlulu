import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { formatPlanPrice } from "@/lib/plans";
import type { Meal } from "@/lib/types";

export function MealCard({
  meal,
  shoppable = false,
}: {
  meal: Meal;
  shoppable?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white shadow-[0_16px_40px_rgba(12,12,12,0.05)]">
      <div className="aspect-4/3 bg-cream-deep">
        {meal.image_url ? (
          // Cloudinary URLs are fine as a plain img without next/image remotePatterns.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={meal.image_url}
            alt={meal.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink/40">
            No image
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl font-medium tracking-tight">
            {meal.name}
          </h3>
          <p className="shrink-0 font-semibold text-sage-deep">
            {formatPlanPrice(meal.price)}
          </p>
        </div>
        {meal.description ? (
          <p className="mt-2 text-sm leading-relaxed text-ink/65">
            {meal.description}
          </p>
        ) : null}
        {shoppable ? <AddToCartButton meal={meal} /> : null}
      </div>
    </article>
  );
}
