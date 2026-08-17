"use client";

import { useQuery } from "@tanstack/react-query";

import { listHabitLogs } from "@/lib/api/logs";
import type { LogRangeQuery } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/context";
import { logKeys } from "@/lib/logs/keys";

export function useHabitLogs(habitId: string, range: LogRangeQuery | null) {
  const { user, isLoading } = useAuth();

  return useQuery({
    queryKey: logKeys.habit(habitId, range?.from ?? "", range?.to ?? ""),
    queryFn: () => listHabitLogs(habitId, range!),
    enabled: !isLoading && Boolean(user) && Boolean(habitId) && Boolean(range),
  });
}
