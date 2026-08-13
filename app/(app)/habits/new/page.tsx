import type { Metadata } from "next";

import { NewHabitForm } from "@/components/habits/new-habit-form";

export const metadata: Metadata = {
  title: "New habit — Momentum",
  description: "Define a habit and see exactly when it will be due.",
};

export default function NewHabitPage() {
  return <NewHabitForm />;
}
