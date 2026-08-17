"use client";

import { useQuery } from "@tanstack/react-query";

import { getHabitStats, getOverviewStats } from "@/lib/api/stats";
import type { StatsRange } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/context";
import { statsKeys } from "@/lib/stats/keys";

export function useOverviewStats(range: StatsRange) {
  const { user, isLoading } = useAuth();

  return useQuery({
    queryKey: statsKeys.overview(range),
    queryFn: () => getOverviewStats(range),
    enabled: !isLoading && Boolean(user),
  });
}

export function useHabitStats(habitId: string, range: StatsRange = "90d") {
  const { user, isLoading } = useAuth();

  return useQuery({
    queryKey: statsKeys.habit(habitId, range),
    queryFn: () => getHabitStats(habitId, range),
    enabled: !isLoading && Boolean(user) && Boolean(habitId),
  });
}
