import { ProfileForm } from "@/components/account/ProfileForm";
import { getProfile } from "@/lib/firebase/firestore";
import { requireUser } from "@/lib/firebase/require-user";
import type { Profile } from "@/lib/types";

export default async function ProfilePage() {
  const user = await requireUser("/account/profile");
  const data = await getProfile(user.token, user.id);

  const profile: Profile = {
    id: user.id,
    full_name: data?.full_name || user.name || "",
    phone: data?.phone ?? null,
    email: data?.email || user.email,
    deleted_at: data?.deleted_at ?? null,
  };

  return (
    <main>
      <h1 className="font-display text-3xl font-medium tracking-tight">Profile</h1>
      <p className="mt-2 text-sm text-ink/60">Your basic account details.</p>
      <ProfileForm profile={profile} />
    </main>
  );
}
