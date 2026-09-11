"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { buttonClass } from "@/components/ui/ButtonLink";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/#plans", label: "Meal Plans" },
];

type HeaderProps = {
  variant?: "overlay" | "solid";
};

export function Header({ variant = "overlay" }: HeaderProps) {
  const [scrolled, setScrolled] = useState(variant === "solid");
  const [open, setOpen] = useState(false);
  const [accountHref, setAccountHref] = useState("/login");
  const [accountLabel, setAccountLabel] = useState("Login");

  useEffect(() => {
    if (variant === "solid") return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setAccountHref("/account");
        setAccountLabel("Account");
      } else {
        setAccountHref("/login");
        setAccountLabel("Login");
      }
    });
  }, []);

  const solid = variant === "solid" || scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? "border-b border-white/10 bg-ink/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-[72px] sm:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="cursor-pointer text-sm text-white/75 transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <a href={accountHref} className={buttonClass("primary", "min-h-11 px-5")}>
            {accountLabel}
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span className="relative block h-3.5 w-5" aria-hidden>
            <span
              className={`absolute left-0 h-px w-full bg-white transition ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 h-px w-full bg-white transition ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-px w-full bg-white transition ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-white/10 bg-ink px-5 py-6 lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base text-white/85"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href={accountHref}
            className={buttonClass("primary", "mt-4 w-full")}
            onClick={() => setOpen(false)}
          >
            {accountLabel}
          </a>
        </div>
      ) : null}
    </header>
  );
}
