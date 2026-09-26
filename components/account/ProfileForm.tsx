"use client";

import { useState, type FormEvent } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Field, inputClass } from "@/components/auth/Field";
import { Button } from "@/components/ui/Button";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { firebaseErrorMessage } from "@/lib/firebase/errors";
import { formatPlanPrice } from "@/lib/plans";
import {
  deliveryLocations,
  isDeliveryLocation,
  type DeliveryLocation,
} from "@/lib/pricing";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [location, setLocation] = useState<DeliveryLocation>(
    profile.delivery_location && isDeliveryLocation(profile.delivery_location)
      ? profile.delivery_location
      : "island",
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const deliveryAddress = String(formData.get("address") ?? "").trim();

    setPending(true);
    try {
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: fullName });
      }
      await updateDoc(doc(getFirebaseDb(), "users", profile.id), {
        full_name: fullName,
        phone,
        delivery_address: deliveryAddress || null,
        delivery_location: location,
      });
      setError("");
      setMessage("Profile updated.");
    } catch (err) {
      setMessage("");
      setError(firebaseErrorMessage(err, "Could not update your profile."));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-md space-y-4">
      <Field label="Name">
        <input
          className={inputClass}
          name="name"
          defaultValue={profile.full_name}
          required
        />
      </Field>
      <Field label="Email">
        <input className={inputClass} value={profile.email ?? ""} disabled />
      </Field>
      <Field label="Phone number">
        <input
          className={inputClass}
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          required
        />
      </Field>
      <Field label="Home address">
        <textarea
          className={`${inputClass} min-h-28 resize-y`}
          name="address"
          defaultValue={profile.delivery_address ?? ""}
          placeholder="House number, street, estate or landmark, area"
        />
      </Field>
      <div>
        <p className="text-sm font-medium text-ink/80">Delivery location</p>
        <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
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
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-sage-deep">{message}</p> : null}
      <Button type="submit" variant="solid" loading={pending} disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
