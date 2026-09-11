"use client";

import type { User } from "firebase/auth";

export async function persistSession(user: User | null) {
  if (!user) {
    await fetch("/api/auth/session", { method: "DELETE" });
    return;
  }

  const idToken = await user.getIdToken();
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}
