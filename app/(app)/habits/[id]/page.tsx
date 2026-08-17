import type { Metadata } from "next";

import { HabitDetailPage } from "@/components/habits/habit-detail-page";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Habit — Momentum",
  description: "Year chain, streaks, and log for this habit.",
};

export default async function HabitDetailRoute({ params }: Props) {
  const { id } = await params;
  return <HabitDetailPage habitId={id} />;
}
