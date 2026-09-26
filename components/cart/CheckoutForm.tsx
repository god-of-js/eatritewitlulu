"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Field, inputClass } from "@/components/auth/Field";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { openPaystackPopup } from "@/lib/paystack-inline";
import { formatPlanPrice } from "@/lib/plans";
import {
  deliveryLocations,
  getDeliveryRate,
  getLocationLabel,
  isDeliveryAddress,
  normalizeDeliveryAddress,
  type DeliveryLocation,
} from "@/lib/pricing";

export function CheckoutForm({
  name,
  phone,
  address = "",
  location: savedLocation = "island",
}: {
  name: string;
  phone: string;
  address?: string;
  location?: DeliveryLocation;
}) {
  const { items, total: mealsTotal, clear } = useCart();
  const [location, setLocation] = useState<DeliveryLocation>(savedLocation);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const deliveryFee = getDeliveryRate(location);
  const total = useMemo(() => mealsTotal + deliveryFee, [mealsTotal, deliveryFee]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const deliveryAddress = normalizeDeliveryAddress(formData.get("address"));
    if (!isDeliveryAddress(deliveryAddress)) {
      setError("Enter your full home address so we can deliver your meals.");
      return;
    }

    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "menu",
          name: String(formData.get("name") ?? "").trim(),
          phone: String(formData.get("phone") ?? "").trim(),
          address: deliveryAddress,
          location,
          items: items.map((item) => ({
            mealId: item.meal_id,
            quantity: item.quantity,
          })),
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        accessCode?: string;
        reference?: string;
        publicKey?: string;
        email?: string;
        amount?: number;
      };
      if (
        !response.ok ||
        !payload.publicKey ||
        !payload.email ||
        !payload.reference ||
        typeof payload.amount !== "number"
      ) {
        throw new Error(payload.error || "Unable to start payment.");
      }

      await openPaystackPopup({
        publicKey: payload.publicKey,
        email: payload.email,
        amountNaira: payload.amount,
        reference: payload.reference,
        accessCode: payload.accessCode,
        onSuccess: (transaction) => {
          void confirmPayment(transaction.reference);
        },
        onCancel: () => {
          setPending(false);
          setError("Payment was closed before completion.");
        },
        onError: (message) => {
          setPending(false);
          setError(message);
        },
      });
    } catch (err) {
      setPending(false);
      setError(err instanceof Error ? err.message : "Payment failed to start.");
    }
  }

  async function confirmPayment(reference: string) {
    try {
      const response = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const payload = (await response.json()) as {
        error?: string;
        orderId?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error || "Payment succeeded but could not be saved.");
      }
      clear();
      window.location.href = payload.orderId
        ? `/account/orders/${payload.orderId}?placed=1`
        : "/account/orders?placed=1";
    } catch (err) {
      setPending(false);
      setError(err instanceof Error ? err.message : "Could not confirm payment.");
    }
  }

  if (!items.length) {
    return (
      <div className="mt-10 rounded-[1.75rem] border border-ink/8 bg-white p-7">
        <p className="text-base text-ink/70">Add meals to your cart before checkout.</p>
        <ButtonLink href="/menu" variant="solid" className="mt-5">
          Browse the menu
        </ButtonLink>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <section className="space-y-4 rounded-[1.75rem] border border-ink/8 bg-white p-6">
          <h2 className="text-lg font-semibold">Your details</h2>
          <Field label="Name">
            <input
              className={inputClass}
              name="name"
              defaultValue={name}
              autoComplete="name"
              required
            />
          </Field>
          <Field label="Phone number">
            <input
              className={inputClass}
              name="phone"
              type="tel"
              defaultValue={phone}
              autoComplete="tel"
              required
            />
          </Field>
        </section>

        <section className="rounded-[1.75rem] border border-ink/8 bg-white p-6">
          <h2 className="text-lg font-semibold">Home address</h2>
          <p className="mt-1 text-sm text-ink/60">
            Where should we deliver your meals?
          </p>
          <div className="mt-4">
            <Field label="Street address">
              <textarea
                className={`${inputClass} min-h-28 resize-y`}
                name="address"
                defaultValue={address}
                placeholder="House number, street, estate or landmark, area"
                autoComplete="street-address"
                required
              />
            </Field>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-ink/8 bg-white p-6">
          <h2 className="text-lg font-semibold">Delivery location</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {deliveryLocations.map((item) => (
              <label
                key={item.id}
                className={`flex cursor-pointer flex-col rounded-2xl border p-4 ${
                  location === item.id ? "border-ink bg-cream" : "border-ink/10"
                }`}
              >
                <input
                  type="radio"
                  name="location"
                  value={item.id}
                  checked={location === item.id}
                  onChange={() => setLocation(item.id)}
                  className="sr-only"
                />
                <span className="font-semibold">{item.label}</span>
                <span className="mt-1 text-sm text-ink/60">
                  {formatPlanPrice(item.price)} per delivery
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-[1.75rem] border border-ink/8 bg-white p-6 lg:sticky lg:top-28">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((item) => (
            <li key={item.meal_id} className="flex justify-between gap-3">
              <span>
                {item.quantity} × {item.name}
              </span>
              <span className="shrink-0 font-medium">
                {formatPlanPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Meals</dt>
            <dd>{formatPlanPrice(mealsTotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Location</dt>
            <dd>{getLocationLabel(location)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Delivery fee</dt>
            <dd>{formatPlanPrice(deliveryFee)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-ink/10 pt-3 text-base">
            <dt className="font-semibold">Total</dt>
            <dd className="font-display text-2xl">{formatPlanPrice(total)}</dd>
          </div>
        </dl>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        <Button
          type="submit"
          variant="solid"
          className="mt-6 w-full"
          loading={pending}
          disabled={pending}
        >
          {pending ? "Opening Paystack..." : "Pay Now"}
        </Button>
      </aside>
    </form>
  );
}
