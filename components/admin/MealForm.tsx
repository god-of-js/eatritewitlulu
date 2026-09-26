"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { Field, inputClass } from "@/components/auth/Field";
import { Button } from "@/components/ui/Button";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { getFirebaseDb } from "@/lib/firebase/client";
import { firebaseErrorMessage } from "@/lib/firebase/errors";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function MealForm() {
  const router = useRouter();
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

    if (!(image instanceof File) || !image.size) {
      setError("Add a photo of the meal.");
      return;
    }
    if (!image.type.startsWith("image/")) {
      setError("The photo must be an image file.");
      return;
    }
    if (image.size > MAX_IMAGE_BYTES) {
      setError("The photo must be smaller than 5MB.");
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
      const imageUrl = await uploadImageToCloudinary(image);
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
      setError(firebaseErrorMessage(err, "Could not save the meal."));
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
        <input className={inputClass} name="name" maxLength={80} required />
      </Field>
      <Field label="Short description">
        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          name="description"
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
          required
        />
      </Field>
      <Field label="Image">
        <input
          className="block w-full text-sm text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cream"
          name="image"
          type="file"
          accept="image/*"
          required
          onChange={onImageChange}
        />
      </Field>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Meal preview"
          className="h-40 w-full rounded-2xl object-cover"
        />
      ) : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-sage-deep">{message}</p> : null}
      <Button type="submit" variant="solid" loading={pending} disabled={pending}>
        {pending ? "Saving meal..." : "Add meal"}
      </Button>
    </form>
  );
}
