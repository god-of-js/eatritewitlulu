import type { ButtonHTMLAttributes, ReactNode } from "react";
import { buttonClass, type ButtonVariant } from "@/components/ui/ButtonLink";
import { Spinner } from "@/components/ui/Spinner";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({
  children,
  variant = "solid",
  loading = false,
  className = "",
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
