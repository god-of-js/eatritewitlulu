"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { Logo } from "@/components/ui/Logo";
import { Spinner } from "@/components/ui/Spinner";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { persistSession } from "@/lib/firebase/persist-session";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/plans", label: "Meal plans" },
  { href: "/account/transactions", label: "Transactions" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/settings", label: "Settings" },
];

export function AccountNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await signOut(getFirebaseAuth());
    await persistSession(null);
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="border-b border-white/10 bg-ink text-white lg:min-h-screen lg:w-64 lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between px-5 py-5 lg:block">
        <Logo />
        <Link href="/" className="text-sm text-white/70 lg:mt-6 lg:block">
          Back to site
        </Link>
      </div>
      <nav
        className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-4 lg:pb-6"
        aria-label="Account"
      >
        {links.map((link) => {
          const current =
            link.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(link.href);
          return (
            <a
              key={link.href}
              href={link.href}
              className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm ${
                current ? "bg-cream text-ink" : "text-white/75 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          );
        })}
        {isAdmin ? (
          <a
            href="/admin"
            className="cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm text-white/75 hover:text-white"
          >
            Admin
          </a>
        ) : null}
        <button
          type="button"
          disabled={loggingOut}
          onClick={() => void logout()}
          className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm text-white/75 hover:text-white disabled:cursor-wait lg:mt-4"
        >
          {loggingOut ? <Spinner className="h-3.5 w-3.5" /> : null}
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </nav>
    </aside>
  );
}
