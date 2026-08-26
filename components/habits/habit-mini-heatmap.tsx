"use client";

import { MiniHeatmap } from "@/components/habits/mini-heatmap";
import { useHabitStats } from "@/lib/stats/hooks";

export function HabitMiniHeatmap({
  habitId,
  label,
  activeWeekdays,
  weeks = 13,
  seed,
  fillRate,
}: {
  habitId: string;
  label: string;
  activeWeekdays?: number[];
  weeks?: number;
  seed: number;
  fillRate: number;
}) {
  const statsQuery = useHabitStats(habitId, "90d");

  return (
    <MiniHeatmap
      heatmap={
        statsQuery.isLoading ? null : (statsQuery.data?.heatmap ?? [])
      }
      seed={seed}
      fillRate={fillRate}
      activeWeekdays={activeWeekdays}
      label={label}
      weeks={weeks}
    />
  );
}
