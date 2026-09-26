import { clampQuantity } from "@/lib/cart";
import { listMeals } from "@/lib/firebase/meals";
import {
  getDeliveryRate,
  getLocationLabel,
  isDeliveryLocation,
  type DeliveryLocation,
} from "@/lib/pricing";
import type { OrderItem } from "@/lib/types";

export type MenuCheckoutItem = {
  mealId: string;
  quantity: number;
};

export async function quoteMenuCart(
  requested: MenuCheckoutItem[],
  location: DeliveryLocation,
) {
  const meals = await listMeals();
  const byId = new Map(meals.map((meal) => [meal.id, meal]));
  const items = requested
    .map((item) => {
      const meal = byId.get(item.mealId);
      if (!meal) return null;
      const quantity = clampQuantity(item.quantity);
      return {
        meal_id: meal.id,
        name: meal.name,
        image_url: meal.image_url,
        price: meal.price,
        quantity,
      } satisfies OrderItem;
    })
    .filter((item): item is OrderItem => Boolean(item));

  const mealsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = getDeliveryRate(location);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    itemCount,
    mealsTotal,
    deliveryFee,
    deliveryLocation: location,
    deliveryLabel: getLocationLabel(location),
    total: mealsTotal + deliveryFee,
  };
}

export function parseMenuCheckoutItems(value: unknown): MenuCheckoutItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const mealId = String(
        "mealId" in item ? item.mealId : "meal_id" in item ? item.meal_id : "",
      );
      const quantity = Number("quantity" in item ? item.quantity : 0);
      if (!mealId || quantity < 1) return null;
      return { mealId, quantity };
    })
    .filter((item): item is MenuCheckoutItem => Boolean(item));
}

export function isMenuLocation(value: string): value is DeliveryLocation {
  return isDeliveryLocation(value);
}
