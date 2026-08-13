import type { Metadata } from "next";

import { TodayPage } from "@/components/today/today-page";

export const metadata: Metadata = {
  title: "Today — Momentum",
  description: "Mark today’s habits. One square per day.",
};

export default function DashboardPage() {
  return <TodayPage />;
}
