"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import type { Meal } from "@/lib/types";

export function AddToCartButton({ meal }: { meal: Meal }) {
  const { addMeal, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = items.find((item) => item.meal_id === meal.id);

  function add() {
    addMeal(meal);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <Button type="button" variant="solid" className="mt-5 w-full" onClick={add}>
      {justAdded
        ? "Added"
        : inCart
          ? `Add another · ${inCart.quantity} in cart`
          : "Add to cart"}
    </Button>
  );
}
