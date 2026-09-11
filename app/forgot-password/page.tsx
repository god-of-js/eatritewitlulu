import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset password">
      <p className="mt-2 text-sm text-ink/60">
        We&apos;ll email you a link to choose a new password.
      </p>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
