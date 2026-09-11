import type { ReactNode } from "react";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink/80">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-ink/15 bg-cream/50 px-4 py-3 text-sm text-ink outline-none transition focus:border-sage-deep";
