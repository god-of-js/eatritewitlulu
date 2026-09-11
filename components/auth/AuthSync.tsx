"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onIdTokenChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { persistSession } from "@/lib/firebase/persist-session";
import { safeNextPath } from "@/lib/utils";

export function AuthSync() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onIdTokenChanged(auth, async (user) => {
      if (!user) return;
      await persistSession(user);
      if (pathname === "/login" || pathname === "/forgot-password") {
        const next = safeNextPath(
          new URLSearchParams(window.location.search).get("next"),
        );
        router.replace(next);
        router.refresh();
      }
    });
  }, [pathname, router]);

  return null;
}
