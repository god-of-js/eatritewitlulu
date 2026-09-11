import type { ReactNode } from "react";

export const buttonVariants = {
  primary:
    "bg-cream text-ink hover:bg-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
  secondary:
    "border border-white/70 bg-transparent text-white hover:bg-white/10",
  ghost:
    "border border-ink/15 bg-transparent text-ink hover:border-ink/40 hover:bg-ink/5",
  solid:
    "bg-ink text-cream hover:bg-charcoal",
  whatsapp:
    "bg-[#25D366] text-white hover:bg-[#1ebe5d] shadow-[0_10px_24px_rgba(37,211,102,0.28)]",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

const baseClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold tracking-wide transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage disabled:cursor-wait disabled:opacity-60";

export function buttonClass(variant: ButtonVariant, className = "") {
  return `${baseClass} ${buttonVariants[variant]} ${className}`;
}

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  return (
    <a href={href} className={buttonClass(variant, className)}>
      {children}
    </a>
  );
}
