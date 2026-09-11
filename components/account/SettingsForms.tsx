"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { deleteUser, updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { Field, inputClass } from "@/components/auth/Field";
import { Button } from "@/components/ui/Button";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { firebaseErrorMessage } from "@/lib/firebase/errors";
import { persistSession } from "@/lib/firebase/persist-session";

export function SettingsForms() {
  const router = useRouter();
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || deleting) return;

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (password !== confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    const user = getFirebaseAuth().currentUser;
    if (!user) {
      setPasswordError("You need to be logged in.");
      return;
    }
    setPending(true);
    try {
      await updatePassword(user, password);
      setPasswordError("");
      setPasswordMessage("Password updated.");
    } catch (err) {
      setPasswordMessage("");
      setPasswordError(
        firebaseErrorMessage(err, "Could not update your password. Log in again and retry."),
      );
    } finally {
      setPending(false);
    }
  }

  async function deleteAccount() {
    if (pending || deleting) return;
    if (
      !window.confirm(
        "Delete your account? Payment records are kept for bookkeeping, but you will lose access.",
      )
    ) {
      return;
    }
    setDeleting(true);
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) {
      setDeleting(false);
      setDeleteError("You need to be logged in.");
      return;
    }
    try {
      await updateDoc(doc(getFirebaseDb(), "users", user.uid), {
        full_name: "Deleted user",
        phone: null,
        email: null,
        deleted_at: new Date().toISOString(),
      });
      await deleteUser(user);
      await persistSession(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      setDeleteError(
        firebaseErrorMessage(err, "Could not delete your account. Log in again and retry."),
      );
      setDeleting(false);
    }
  }

  return (
    <div className="mt-8 max-w-lg space-y-10">
      <section className="rounded-[1.75rem] border border-ink/8 bg-white p-6">
        <h2 className="text-lg font-semibold">Change password</h2>
        <form onSubmit={changePassword} className="mt-4 space-y-4">
          <Field label="New password">
            <input
              className={inputClass}
              type="password"
              name="password"
              minLength={6}
              required
            />
          </Field>
          <Field label="Confirm password">
            <input
              className={inputClass}
              type="password"
              name="confirm"
              minLength={6}
              required
            />
          </Field>
          {passwordError ? (
            <p className="text-sm text-red-700">{passwordError}</p>
          ) : null}
          {passwordMessage ? (
            <p className="text-sm text-sage-deep">{passwordMessage}</p>
          ) : null}
          <Button type="submit" variant="solid" loading={pending} disabled={pending || deleting}>
            {pending ? "Updating..." : "Update password"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-ink/60">
          Can&apos;t sign in later? Use{" "}
          <a href="/forgot-password" className="underline">
            forgot password
          </a>
          .
        </p>
      </section>

      <section className="rounded-[1.75rem] border border-red-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Delete account</h2>
        <p className="mt-2 text-sm text-ink/65">
          This removes your login and personal details. Subscription and payment
          records stay on file for accounting.
        </p>
        {deleteError ? <p className="mt-3 text-sm text-red-700">{deleteError}</p> : null}
        <Button
          type="button"
          variant="ghost"
          className="mt-4 border-red-300 text-red-700"
          loading={deleting}
          disabled={deleting || pending}
          onClick={() => void deleteAccount()}
        >
          {deleting ? "Deleting..." : "Delete account"}
        </Button>
      </section>
    </div>
  );
}
