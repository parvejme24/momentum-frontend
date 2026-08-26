import type { Metadata } from "next";

import { EditHabitForm } from "@/components/habits/new-habit-form";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit habit — Momentum",
  description: "Update name, schedule, icon, and targets for this habit.",
};

export default async function EditHabitRoute({ params }: Props) {
  const { id } = await params;
  return <EditHabitForm habitId={id} />;
}
