"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPasswordReset } from "firebase/auth";
import { Field, inputClass } from "@/components/auth/Field";
import { Button } from "@/components/ui/Button";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { firebaseErrorMessage } from "@/lib/firebase/errors";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode") ?? "";
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!oobCode) {
      setError("Open the reset link from your email to choose a new password.");
      return;
    }
    setPending(true);
    try {
      await confirmPasswordReset(getFirebaseAuth(), oobCode, password);
      setError("");
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(firebaseErrorMessage(err, "Could not update your password."));
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <Field label="New password">
        <input
          className={inputClass}
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </Field>
      <Field label="Confirm password">
        <input
          className={inputClass}
          type="password"
          name="confirm"
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
        {pending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
