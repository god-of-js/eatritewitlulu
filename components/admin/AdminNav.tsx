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
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/admins", label: "Admins" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await signOut(getFirebaseAuth());
    await persistSession(null);
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="border-b border-white/10 bg-ink text-white lg:min-h-screen lg:w-64 lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between px-5 py-5 lg:block">
        <Logo />
        <p className="mt-3 hidden text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45 lg:block">
          Admin
        </p>
        <Link href="/" className="text-sm text-white/70 lg:mt-6 lg:block">
          Back to site
        </Link>
      </div>
      <nav
        className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-4 lg:pb-6"
        aria-label="Admin"
      >
        {links.map((link) => {
          const current =
            link.href === "/admin"
              ? pathname === "/admin"
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
        <a
          href="/account"
          className="cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm text-white/75 hover:text-white"
        >
          Customer account
        </a>
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
