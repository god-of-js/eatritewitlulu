"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Field, inputClass } from "@/components/auth/Field";
import { Button } from "@/components/ui/Button";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { firebaseErrorMessage } from "@/lib/firebase/errors";
import { persistSession } from "@/lib/firebase/persist-session";
import { safeNextPath } from "@/lib/utils";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"), "/admin");
  const dest = next.startsWith("/admin") ? next : "/admin";
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

      const check = await fetch("/api/admin/me");
      const access = (await check.json()) as { admin?: boolean };
      if (!access.admin) {
        await signOut(getFirebaseAuth());
        await persistSession(null);
        throw new Error("This account does not have admin access.");
      }

      await fetch("/api/admin/bootstrap", { method: "POST" });
      setError("");
      router.push(dest);
      router.refresh();
    } catch (err) {
      setError(firebaseErrorMessage(err, "Could not log in as admin."));
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <Field label="Admin email">
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
        {pending ? "Signing in..." : "Log in to admin"}
      </Button>
    </form>
  );
}
