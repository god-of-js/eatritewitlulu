"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Field, inputClass } from "@/components/auth/Field";
import { Button } from "@/components/ui/Button";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { firebaseErrorMessage } from "@/lib/firebase/errors";
import { persistSession } from "@/lib/firebase/persist-session";
import { safeNextPath } from "@/lib/utils";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setPending(true);

    try {
      const auth = getFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      await setDoc(doc(getFirebaseDb(), "users", credential.user.uid), {
        full_name: name,
        phone,
        email,
        deleted_at: null,
      });
      await persistSession(credential.user);
      setError("");
      router.push(next);
      router.refresh();
    } catch (err) {
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        await signOut(auth);
        await persistSession(null);
      }
      setError(firebaseErrorMessage(err, "Could not create your account."));
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <Field label="Name">
        <input className={inputClass} name="name" autoComplete="name" required />
      </Field>
      <Field label="Email">
        <input
          className={inputClass}
          type="email"
          name="email"
          autoComplete="email"
          required
        />
      </Field>
      <Field label="Phone number">
        <input
          className={inputClass}
          type="tel"
          name="phone"
          autoComplete="tel"
          required
        />
      </Field>
      <Field label="Password">
        <input
          className={inputClass}
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </Field>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button
        type="submit"
        variant="solid"
        className="w-full"
        loading={pending}
        disabled={pending}
      >
        {pending ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-ink/60">
        Already have an account?{" "}
        <a className="font-semibold text-ink" href={`/login?next=${encodeURIComponent(next)}`}>
          Log in
        </a>
      </p>
    </form>
  );
}
