"use client";

import { useCart } from "@/components/cart/CartProvider";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { formatPlanPrice } from "@/lib/plans";

export function CartView() {
  const { items, total, setQuantity, removeItem } = useCart();

  if (!items.length) {
    return (
      <div className="mt-10 rounded-[1.75rem] border border-ink/8 bg-white p-7">
        <p className="text-base text-ink/70">Your cart is empty.</p>
        <ButtonLink href="/menu" variant="solid" className="mt-5">
          Browse the menu
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_20rem]">
      <ul className="divide-y divide-ink/10 overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white">
        {items.map((item) => (
          <li key={item.meal_id} className="flex gap-4 px-5 py-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium">{item.name}</p>
                <p className="shrink-0 font-semibold">
                  {formatPlanPrice(item.price * item.quantity)}
                </p>
              </div>
              <p className="mt-1 text-sm text-ink/55">{formatPlanPrice(item.price)} each</p>
              <div className="mt-3 flex items-center gap-3">
                <label className="text-sm text-ink/60">
                  Qty
                  <input
                    className="ml-2 w-16 rounded-xl border border-ink/15 bg-cream/50 px-2 py-1 text-sm"
                    type="number"
                    min={1}
                    max={20}
                    value={item.quantity}
                    onChange={(event) =>
                      setQuantity(item.meal_id, Number(event.target.value))
                    }
                  />
                </label>
                <button
                  type="button"
                  className="text-sm underline"
                  onClick={() => removeItem(item.meal_id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-[1.75rem] border border-ink/8 bg-white p-6">
        <p className="text-sm text-ink/55">Total</p>
        <p className="mt-1 font-display text-3xl">{formatPlanPrice(total)}</p>
        <ButtonLink href="/checkout" variant="solid" className="mt-5 w-full">
          Checkout
        </ButtonLink>
      </aside>
    </div>
  );
}
