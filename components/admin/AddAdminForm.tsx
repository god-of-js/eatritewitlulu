"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field, inputClass } from "@/components/auth/Field";
import { Button } from "@/components/ui/Button";

export function AddAdminForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? "").trim(),
          email: String(formData.get("email") ?? "").trim(),
          password: String(formData.get("password") ?? ""),
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Could not create the admin.");
      }
      form.reset();
      setMessage("Admin created. They can log in at /admin/login.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the admin.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 max-w-md space-y-4 rounded-[1.75rem] border border-ink/8 bg-white p-6"
    >
      <Field label="Name">
        <input className={inputClass} name="name" autoComplete="name" required />
      </Field>
      <Field label="Email">
        <input
          className={inputClass}
          type="email"
          name="email"
          autoComplete="off"
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
      {message ? <p className="text-sm text-sage-deep">{message}</p> : null}
      <Button type="submit" variant="solid" loading={pending} disabled={pending}>
        {pending ? "Creating admin..." : "Add admin"}
      </Button>
    </form>
  );
}
