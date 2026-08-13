import type { Metadata } from "next";

import { HabitDetailPage } from "@/components/habits/habit-detail-page";
import { getHabitDetail } from "@/components/habits/habit-detail-data";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const habit = getHabitDetail(id);
  return {
    title: habit ? `${habit.title} — Momentum` : "Habit — Momentum",
    description: habit
      ? `Year chain, streaks, and log for ${habit.title}.`
      : "Habit detail",
  };
}

export default async function HabitDetailRoute({ params }: Props) {
  const { id } = await params;
  return <HabitDetailPage habitId={id} />;
}
