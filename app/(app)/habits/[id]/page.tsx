import type { Metadata } from "next";
import Link from "next/link";

import { ACTIVE_HABITS, INITIAL_ARCHIVED } from "@/components/habits/sample-data";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const habit =
    ACTIVE_HABITS.find((h) => h.id === id) ||
    INITIAL_ARCHIVED.find((h) => h.id === id);
  return {
    title: habit ? `${habit.title} — Momentum` : "Habit — Momentum",
  };
}

export default async function HabitDetailPage({ params }: Props) {
  const { id } = await params;
  const habit =
    ACTIVE_HABITS.find((h) => h.id === id) ||
    INITIAL_ARCHIVED.find((h) => h.id === id);

  return (
    <div className="page-head">
      <p className="eyebrow">Habit</p>
      <h1>{habit?.title ?? "Habit"}</h1>
      <p className="lede" style={{ marginTop: 12 }}>
        {habit
          ? "Detail view, edit, and full history come next. The library already shows the recent chain."
          : "This habit isn’t in the sample library."}
      </p>
      <p style={{ marginTop: 24 }}>
        <Link href="/habits" className="btn btn-primary">
          Back to habits
        </Link>
      </p>
    </div>
  );
}
