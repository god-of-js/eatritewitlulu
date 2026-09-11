import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthShell title="Create an account">
      <p className="mt-2 text-sm text-ink/60">
        Only your name, email, phone and password are required.
      </p>
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
