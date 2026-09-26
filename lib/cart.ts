import type { Meal } from "@/lib/types";

export const CART_STORAGE_KEY = "eatrite_cart";
export const MAX_CART_QUANTITY = 20;

export type CartItem = {
  meal_id: string;
  name: string;
  image_url: string;
  price: number;
  quantity: number;
};

export function cartFromMeal(meal: Meal, quantity = 1): CartItem {
  return {
    meal_id: meal.id,
    name: meal.name,
    image_url: meal.image_url,
    price: meal.price,
    quantity,
  };
}

export function clampQuantity(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_CART_QUANTITY, Math.max(1, Math.round(value)));
}

export function cartItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item?.meal_id && item.name && item.quantity > 0)
      .map((item) => ({
        meal_id: String(item.meal_id),
        name: String(item.name),
        image_url: String(item.image_url ?? ""),
        price: Number(item.price) || 0,
        quantity: clampQuantity(Number(item.quantity)),
      }));
  } catch {
    return [];
  }
}
