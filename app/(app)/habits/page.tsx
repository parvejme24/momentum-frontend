import type { Metadata } from "next";

import { HabitsPage } from "@/components/habits/habits-page";

export const metadata: Metadata = {
  title: "Habits — Momentum",
  description: "Browse every habit and its recent chain.",
};

export default function HabitsRoutePage() {
  return <HabitsPage />;
}
