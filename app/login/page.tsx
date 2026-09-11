import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell title="Log in">
      <p className="mt-2 text-sm text-ink/60">
        Access your plans, payments and account.
      </p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
