"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { Field, inputClass } from "@/components/auth/Field";
import { Button } from "@/components/ui/Button";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { getFirebaseDb } from "@/lib/firebase/client";
import { firebaseErrorMessage } from "@/lib/firebase/errors";
import type { Meal } from "@/lib/types";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function MealForm({ meal }: { meal?: Meal }) {
  const router = useRouter();
  const editing = Boolean(meal);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState("");

  function onImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : "");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const price = Number(formData.get("price"));
    const image = formData.get("image");
    const hasNewImage = image instanceof File && image.size > 0;

    if (hasNewImage) {
      if (!image.type.startsWith("image/")) {
        setError("The photo must be an image file.");
        return;
      }
      if (image.size > MAX_IMAGE_BYTES) {
        setError("The photo must be smaller than 5MB.");
        return;
      }
    } else if (!editing) {
      setError("Add a photo of the meal.");
      return;
    }

    if (!name || !Number.isFinite(price) || price < 0) {
      setError("Enter a name and a valid price.");
      return;
    }

    setPending(true);
    setError("");
    setMessage("");

    try {
      const imageUrl = hasNewImage
        ? await uploadImageToCloudinary(image)
        : meal?.image_url ?? "";

      if (editing && meal) {
        await updateDoc(doc(getFirebaseDb(), "meals", meal.id), {
          name,
          description,
          price: Math.round(price),
          image_url: imageUrl,
        });
        setMessage("Meal updated.");
        router.push("/admin/menu");
        router.refresh();
        return;
      }

      await addDoc(collection(getFirebaseDb(), "meals"), {
        name,
        description,
        price: Math.round(price),
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      });

      form.reset();
      if (preview) URL.revokeObjectURL(preview);
      setPreview("");
      setMessage("Meal added to the menu.");
      router.refresh();
    } catch (err) {
      setError(
        firebaseErrorMessage(
          err,
          editing ? "Could not update the meal." : "Could not save the meal.",
        ),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 max-w-md space-y-4 rounded-[1.75rem] border border-ink/8 bg-white p-6"
    >
      <Field label="Name of food">
        <input
          className={inputClass}
          name="name"
          defaultValue={meal?.name}
          maxLength={80}
          required
        />
      </Field>
      <Field label="Short description">
        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          name="description"
          defaultValue={meal?.description}
          maxLength={200}
          required
        />
      </Field>
      <Field label="Price (₦)">
        <input
          className={inputClass}
          name="price"
          type="number"
          min={0}
          step={1}
          defaultValue={meal?.price}
          required
        />
      </Field>
      <Field label={editing ? "Replace image" : "Image"}>
        <input
          className="block w-full text-sm text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cream"
          name="image"
          type="file"
          accept="image/*"
          required={!editing}
          onChange={onImageChange}
        />
      </Field>
      {preview || meal?.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview || meal?.image_url}
          alt={meal?.name || "Meal preview"}
          className="h-40 w-full rounded-2xl object-cover"
        />
      ) : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-sage-deep">{message}</p> : null}
      <Button type="submit" variant="solid" loading={pending} disabled={pending}>
        {pending
          ? editing
            ? "Saving changes..."
            : "Saving meal..."
          : editing
            ? "Save changes"
            : "Add meal"}
      </Button>
    </form>
  );
}
