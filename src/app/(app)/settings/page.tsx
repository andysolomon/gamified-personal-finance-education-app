"use client";

import { ProfileForm } from "@/components/settings/profile-form";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground mt-2 mb-6">Manage your account and preferences.</p>
      <ProfileForm />
    </div>
  );
}
