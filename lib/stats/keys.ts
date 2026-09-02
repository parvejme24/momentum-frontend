import type { StatsRange } from "@/lib/api/types";

export const statsKeys = {
  all: ["stats"] as const,
  overviewRoot: () => [...statsKeys.all, "overview"] as const,
  overview: (range: StatsRange) =>
    [...statsKeys.overviewRoot(), range] as const,
  habitRoot: (habitId: string) => [...statsKeys.all, "habit", habitId] as const,
  habit: (habitId: string, range: StatsRange) =>
    [...statsKeys.habitRoot(habitId), range] as const,
};
