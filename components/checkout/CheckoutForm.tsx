"use client";

import { useEffect, useMemo, useState } from "react";
import { Field, inputClass } from "@/components/auth/Field";
import { Button } from "@/components/ui/Button";
import { formatPlanPrice, type MealPlan } from "@/lib/plans";
import { openPaystackPopup } from "@/lib/paystack-inline";
import {
  billingPeriods,
  calculateOrder,
  deliveryFrequencies,
  deliveryLocations,
  getBillingPeriodLabel,
  getFrequencyLabel,
  getLocationLabel,
  isDeliveryAddress,
  normalizeDeliveryAddress,
  type BillingPeriod,
  type DeliveryFrequency,
  type DeliveryLocation,
} from "@/lib/pricing";
import { formatLagosDate, getPlanStartDateInput } from "@/lib/start-date";

export function CheckoutForm({ plan }: { plan: MealPlan }) {
  const [period, setPeriod] = useState<BillingPeriod>("month");
  const [frequency, setFrequency] = useState<DeliveryFrequency>("3x-week");
  const [location, setLocation] = useState<DeliveryLocation>("island");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const startDate = useMemo(() => getPlanStartDateInput(now), [now]);

  const order = useMemo(
    () => calculateOrder(plan, frequency, location, period),
    [plan, frequency, location, period],
  );

  async function pay() {
    if (pending) return;
    const deliveryAddress = normalizeDeliveryAddress(address);
    if (!isDeliveryAddress(deliveryAddress)) {
      setError("Enter your full home address so we can deliver your meals.");
      return;
    }

    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          period,
          frequency,
          location,
          address: deliveryAddress,
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
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Payment succeeded but could not be saved.");
      }
      window.location.href = "/account?paid=1";
    } catch (err) {
      setPending(false);
      setError(err instanceof Error ? err.message : "Could not confirm payment.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <section className="rounded-[1.75rem] border border-ink/8 bg-white p-6">
          <h2 className="text-lg font-semibold">How long?</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {billingPeriods.map((item) => {
              const price =
                item.id === "week" ? plan.weeklyPrice : plan.monthlyPrice;
              const meals =
                item.id === "week" ? plan.mealsPerWeek : plan.mealsPerMonth;
              const days =
                item.id === "week" ? plan.daysPerWeek : plan.daysTotal;
              return (
                <label
                  key={item.id}
                  className={`flex cursor-pointer flex-col rounded-2xl border p-4 ${
                    period === item.id ? "border-ink bg-cream" : "border-ink/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="period"
                    value={item.id}
                    checked={period === item.id}
                    onChange={() => setPeriod(item.id)}
                    className="sr-only"
                  />
                  <span className="font-semibold">{item.label}</span>
                  <span className="mt-1 font-display text-xl">
                    {formatPlanPrice(price)}
                  </span>
                  <span className="mt-1 text-sm text-ink/60">
                    {meals} meals · {days} days
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-ink/8 bg-white p-6">
          <h2 className="text-lg font-semibold">Delivery frequency</h2>
          <div className="mt-4 grid gap-3">
            {deliveryFrequencies.map((item) => (
              <label
                key={item.id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${
                  frequency === item.id
                    ? "border-ink bg-cream"
                    : "border-ink/10"
                }`}
              >
                <input
                  type="radio"
                  name="frequency"
                  value={item.id}
                  checked={frequency === item.id}
                  onChange={() => setFrequency(item.id)}
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold">{item.label}</span>
                  <span className="text-sm text-ink/60">{item.description}</span>
                </span>
              </label>
            ))}
          </div>
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
                value={address}
                onChange={(event) => setAddress(event.target.value)}
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
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Meal plan</dt>
            <dd className="text-right font-medium">{plan.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Duration</dt>
            <dd>{getBillingPeriodLabel(period)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Meals</dt>
            <dd>{order.mealsCovered}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Days</dt>
            <dd>{order.daysCovered}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Starts</dt>
            <dd className="text-right">{formatLagosDate(startDate)}</dd>
          </div>
          <p className="text-xs leading-relaxed text-ink/50">
            Plans start on a weekday. The kitchen cutoff is 10pm Lagos time.
          </p>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Plan price</dt>
            <dd>{formatPlanPrice(order.planPrice)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Delivery</dt>
            <dd>{getFrequencyLabel(frequency)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Deliveries</dt>
            <dd>{order.deliveryCount}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Location</dt>
            <dd>{getLocationLabel(location)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Address</dt>
            <dd className="max-w-56 text-right">
              {normalizeDeliveryAddress(address) || "Add your home address"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Delivery fee</dt>
            <dd>{formatPlanPrice(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-ink/10 pt-3 text-base">
            <dt className="font-semibold">Total</dt>
            <dd className="font-display text-2xl">
              {formatPlanPrice(order.total)}
            </dd>
          </div>
        </dl>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        <Button
          type="button"
          variant="solid"
          className="mt-6 w-full"
          loading={pending}
          disabled={pending}
          onClick={() => void pay()}
        >
          {pending ? "Opening Paystack..." : "Pay Now"}
        </Button>
      </aside>
    </div>
  );
}
