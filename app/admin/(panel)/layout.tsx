import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/firebase/require-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-cream text-ink lg:flex">
      <AdminNav />
      <div className="flex-1 px-5 py-8 sm:px-8">{children}</div>
    </div>
  );
}
