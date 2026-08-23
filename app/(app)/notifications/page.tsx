import type { Metadata } from "next";

import { NotificationsPage } from "@/components/notifications/notifications-page";

export const metadata: Metadata = {
  title: "Notifications — Momentum",
  description: "Account and billing notices.",
};

export default function NotificationsRoutePage() {
  return <NotificationsPage />;
}
