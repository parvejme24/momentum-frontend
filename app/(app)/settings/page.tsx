import type { Metadata } from "next";

import { SettingsPage } from "@/components/settings/settings-page";

export const metadata: Metadata = {
  title: "Settings — Momentum",
  description: "Profile, timezone, password, notifications, and account data.",
};

export default function SettingsRoutePage() {
  return <SettingsPage />;
}
