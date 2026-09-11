"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Field, inputClass } from "@/components/auth/Field";
import { Button } from "@/components/ui/Button";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { firebaseErrorMessage } from "@/lib/firebase/errors";
import { persistSession } from "@/lib/firebase/persist-session";
import { safeNextPath } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    setPending(true);
    try {
      const credential = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        String(formData.get("email") ?? ""),
        String(formData.get("password") ?? ""),
      );
      await persistSession(credential.user);
      setError("");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(firebaseErrorMessage(err, "Could not log in."));
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <Field label="Email">
        <input
          className={inputClass}
          type="email"
          name="email"
          autoComplete="email"
          required
        />
      </Field>
      <Field label="Password">
        <input
          className={inputClass}
          type="password"
          name="password"
          autoComplete="current-password"
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
        {pending ? "Signing in..." : "Log in"}
      </Button>
      <p className="text-center text-sm text-ink/60">
        <a className="underline" href="/forgot-password">
          Forgot password?
        </a>
      </p>
      <p className="text-center text-sm text-ink/60">
        New here?{" "}
        <a className="font-semibold text-ink" href={`/signup?next=${encodeURIComponent(next)}`}>
          Create an account
        </a>
      </p>
    </form>
  );
}
