"use client";

import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { buttonClass } from "@/components/ui/ButtonLink";
import { formatPlanPrice } from "@/lib/plans";

export function CartBar() {
  const pathname = usePathname();
  const { count, total, ready } = useCart();

  if (!ready || count < 1) return null;
  if (pathname === "/checkout" || pathname.startsWith("/admin")) return null;

  return (
    <>
      <div className="h-28 sm:h-24" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink/95 px-5 py-3 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              {count} {count === 1 ? "item" : "items"} in cart
            </p>
            <p className="mt-0.5 font-display text-2xl text-white">
              {formatPlanPrice(total)}
            </p>
          </div>
          <div className="flex shrink-0 flex-row items-center gap-2">
            <a href="/cart" className={buttonClass("secondary", "min-h-12 px-4 sm:px-5")}>
              View cart
            </a>
            <a href="/checkout" className={buttonClass("primary", "min-h-12 px-4 sm:px-6")}>
              Checkout
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
