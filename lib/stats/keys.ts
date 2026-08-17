import type { StatsRange } from "@/lib/api/types";

export const statsKeys = {
  all: ["stats"] as const,
  overview: (range: StatsRange) => [...statsKeys.all, "overview", range] as const,
  habit: (habitId: string, range: StatsRange) =>
    [...statsKeys.all, "habit", habitId, range] as const,
};
