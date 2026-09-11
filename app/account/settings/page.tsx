import { SettingsForms } from "@/components/account/SettingsForms";

export default function SettingsPage() {
  return (
    <main>
      <h1 className="font-display text-3xl font-medium tracking-tight">Settings</h1>
      <p className="mt-2 text-sm text-ink/60">
        Password, account recovery and account deletion.
      </p>
      <SettingsForms />
    </main>
  );
}
