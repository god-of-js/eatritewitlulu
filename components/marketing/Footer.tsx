import { Logo } from "@/components/ui/Logo";
import { siteConfig } from "@/lib/config";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/#plans", label: "Meal plans" },
  { href: "/login", label: "Login" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-ink pb-24 text-white md:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-12 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-white/55">
            Healthy, convenient meals planned around your goals. Choose a plan
            and subscribe directly on the website.
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Explore
          </p>
          <ul className="mt-4 space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Account
          </p>
          <a
            href="/account"
            className="mt-4 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            Customer dashboard
          </a>
        </div>
      </div>

      <div className="border-t border-white/8">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-white/35 sm:px-8">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
