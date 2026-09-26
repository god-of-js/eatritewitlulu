"use client";

import { useCart } from "@/components/cart/CartProvider";

export function CartLink({ className = "" }: { className?: string }) {
  const { count } = useCart();

  return (
    <a href="/cart" className={className}>
      Cart{count ? ` (${count})` : ""}
    </a>
  );
}
