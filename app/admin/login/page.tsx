import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function AdminLoginPage() {
  return (
    <AuthShell title="Admin">
      <p className="mt-2 text-sm text-ink/60">Staff login only.</p>
      <Suspense>
        <AdminLoginForm />
      </Suspense>
    </AuthShell>
  );
}
