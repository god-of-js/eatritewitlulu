"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { buttonClass } from "@/components/ui/ButtonLink";

export function MobileStickyCTA() {
  const { count, ready } = useCart();
  if (ready && count > 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 p-3 backdrop-blur-md md:hidden">
      <Link href="/#plans" className={buttonClass("primary", "w-full")}>
        Subscribe to a plan
      </Link>
    </div>
  );
}
