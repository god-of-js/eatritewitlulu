import type { ReactNode } from "react";
import { Header } from "@/components/marketing/Header";
import { Logo } from "@/components/ui/Logo";

export function AuthShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <Header variant="solid" />
      <main
        id="main"
        className="flex min-h-screen items-center justify-center bg-cream px-5 py-28 text-ink"
      >
        <div className="w-full max-w-md rounded-[2rem] border border-ink/8 bg-white p-7 shadow-[0_16px_40px_rgba(12,12,12,0.05)]">
          <Logo tone="dark" />
          <h1 className="mt-6 font-display text-3xl font-medium tracking-tight">
            {title}
          </h1>
          {children}
        </div>
      </main>
    </>
  );
}
