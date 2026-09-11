"use client";

import { useState, type FormEvent } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Field, inputClass } from "@/components/auth/Field";
import { Button } from "@/components/ui/Button";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { firebaseErrorMessage } from "@/lib/firebase/errors";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    setPending(true);
    try {
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: fullName });
      }
      await updateDoc(doc(getFirebaseDb(), "users", profile.id), {
        full_name: fullName,
        phone,
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
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-sage-deep">{message}</p> : null}
      <Button type="submit" variant="solid" loading={pending} disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
