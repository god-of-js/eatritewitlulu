import type { ReactNode } from "react";

type WhatsAppLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "whatsapp";
  className?: string;
};

const variants = {
  primary:
    "bg-cream text-ink hover:bg-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
  secondary:
    "border border-white/70 bg-transparent text-white hover:bg-white/10",
  ghost:
    "border border-ink/15 bg-transparent text-ink hover:border-ink/40 hover:bg-ink/5",
  whatsapp:
    "bg-[#25D366] text-white hover:bg-[#1ebe5d] shadow-[0_10px_24px_rgba(37,211,102,0.28)]",
};

export function WhatsAppLink({
  href,
  children,
  variant = "primary",
  className = "",
}: WhatsAppLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold tracking-wide transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage ${variants[variant]} ${className}`}
    >
      {children}
    </a>
  );
}
