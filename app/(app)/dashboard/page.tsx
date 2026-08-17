import type { Metadata } from "next";

import { RoleDashboard } from "@/components/app/role-dashboard";

export const metadata: Metadata = {
  title: "Dashboard — Momentum",
  description: "Your Momentum home — today for customers, overview for admins.",
};

export default function DashboardPage() {
  return <RoleDashboard />;
}
