"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CART_STORAGE_KEY,
  cartFromMeal,
  cartItemCount,
  cartTotal,
  clampQuantity,
  readStoredCart,
  type CartItem,
} from "@/lib/cart";
import type { Meal } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  addMeal: (meal: Meal) => void;
  setQuantity: (mealId: string, quantity: number) => void;
  removeItem: (mealId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: cartItemCount(items),
      total: cartTotal(items),
      ready,
      addMeal(meal) {
        setItems((current) => {
          const existing = current.find((item) => item.meal_id === meal.id);
          if (!existing) return [...current, cartFromMeal(meal)];
          return current.map((item) =>
            item.meal_id === meal.id
              ? { ...item, quantity: clampQuantity(item.quantity + 1) }
              : item,
          );
        });
      },
      setQuantity(mealId, quantity) {
        setItems((current) =>
          current.map((item) =>
            item.meal_id === mealId
              ? { ...item, quantity: clampQuantity(quantity) }
              : item,
          ),
        );
      },
      removeItem(mealId) {
        setItems((current) => current.filter((item) => item.meal_id !== mealId));
      },
      clear() {
        setItems([]);
      },
    }),
    [items, ready],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) {
    throw new Error("useCart must be used inside CartProvider.");
  }
  return cart;
}
