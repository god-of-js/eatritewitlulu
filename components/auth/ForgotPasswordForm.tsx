"use client";

import { useState, type FormEvent } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Field, inputClass } from "@/components/auth/Field";
import { Button } from "@/components/ui/Button";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { firebaseErrorMessage } from "@/lib/firebase/errors";
import { getSiteUrl } from "@/lib/config";

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    setPending(true);
    try {
      await sendPasswordResetEmail(
        getFirebaseAuth(),
        String(formData.get("email") ?? ""),
        { url: `${getSiteUrl()}/login` },
      );
      setError("");
      setMessage("If that email exists, we sent a reset link.");
    } catch (err) {
      setMessage("");
      setError(firebaseErrorMessage(err, "Could not send a reset link."));
    } finally {
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
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-sage-deep">{message}</p> : null}
      <Button
        type="submit"
        variant="solid"
        className="w-full"
        loading={pending}
        disabled={pending}
      >
        {pending ? "Sending..." : "Send reset link"}
      </Button>
      <p className="text-center text-sm text-ink/60">
        <a className="underline" href="/login">
          Back to login
        </a>
      </p>
    </form>
  );
}
