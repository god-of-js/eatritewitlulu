"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getFirebaseDb } from "@/lib/firebase/client";
import { firebaseErrorMessage } from "@/lib/firebase/errors";

export function MealActions({ mealId }: { mealId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function remove() {
    if (pending) return;
    if (!window.confirm("Delete this meal from the menu?")) return;

    setPending(true);
    setError("");
    try {
      await deleteDoc(doc(getFirebaseDb(), "meals", mealId));
      router.refresh();
    } catch (err) {
      setError(firebaseErrorMessage(err, "Could not delete the meal."));
      setPending(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <ButtonLink href={`/admin/menu/${mealId}`} variant="ghost" className="min-h-10 px-4">
        Edit
      </ButtonLink>
      <Button
        type="button"
        variant="ghost"
        className="min-h-10 px-4"
        loading={pending}
        disabled={pending}
        onClick={() => void remove()}
      >
        {pending ? "Deleting..." : "Delete"}
      </Button>
      {error ? <p className="w-full text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
